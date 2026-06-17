import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch 
} from "firebase/firestore";
import { db, isFirebaseAvailable } from "../config/firebase";
import { generateQuestions } from "../data/questionsGenerator";

const DatabaseContext = createContext(null);

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load question bank on startup
  useEffect(() => {
    async function loadData() {
      if (!isFirebaseAvailable) {
        // Fallback local storage setup
        const storedQs = localStorage.getItem("sbi_clerk_questions");
        if (storedQs) {
          setQuestions(JSON.parse(storedQs));
        } else {
          // Generate the 800 questions and seed
          console.log("Generating and seeding 800 mock questions into LocalStorage...");
          const seededQs = generateQuestions();
          localStorage.setItem("sbi_clerk_questions", JSON.stringify(seededQs));
          setQuestions(seededQs);
        }
        setLoading(false);
      } else {
        // Load from Firestore
        try {
          const qCollection = collection(db, "questions");
          const qSnapshot = await getDocs(qCollection);
          const list = qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          if (list.length > 0) {
            setQuestions(list);
          } else {
            // Seed Firestore with 800 questions if completely empty
            console.log("Firestore question bank is empty. Seeding 800 questions...");
            const seededQs = generateQuestions();
            
            // Batch writes to write efficiently in chunks of 500
            const batchChunks = [];
            for (let i = 0; i < seededQs.length; i += 400) {
              batchChunks.push(seededQs.slice(i, i + 400));
            }

            for (const chunk of batchChunks) {
              const batch = writeBatch(db);
              chunk.forEach((q) => {
                const docRef = doc(collection(db, "questions"));
                batch.set(docRef, q);
              });
              await batch.commit();
            }
            console.log("Firestore seeding complete.");
            
            // Reload
            const freshSnapshot = await getDocs(qCollection);
            setQuestions(freshSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        } catch (error) {
          console.error("Error loading questions from Firestore. Trying LocalStorage backup...", error);
          const storedQs = localStorage.getItem("sbi_clerk_questions");
          if (storedQs) {
            setQuestions(JSON.parse(storedQs));
          } else {
            const seededQs = generateQuestions();
            localStorage.setItem("sbi_clerk_questions", JSON.stringify(seededQs));
            setQuestions(seededQs);
          }
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, []);

  // CRUD: Add Question
  async function addQuestion(newQ) {
    if (!isFirebaseAvailable) {
      const updated = [...questions, { ...newQ, id: questions.length + 1 }];
      localStorage.setItem("sbi_clerk_questions", JSON.stringify(updated));
      setQuestions(updated);
      return newQ;
    } else {
      const docRef = await addDoc(collection(db, "questions"), newQ);
      const added = { ...newQ, id: docRef.id };
      setQuestions(prev => [...prev, added]);
      return added;
    }
  }

  // CRUD: Edit Question
  async function updateQuestion(id, updatedFields) {
    if (!isFirebaseAvailable) {
      const updated = questions.map(q => q.id === id ? { ...q, ...updatedFields } : q);
      localStorage.setItem("sbi_clerk_questions", JSON.stringify(updated));
      setQuestions(updated);
    } else {
      const docRef = doc(db, "questions", id);
      await updateDoc(docRef, updatedFields);
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updatedFields } : q));
    }
  }

  // CRUD: Delete Question
  async function deleteQuestion(id) {
    if (!isFirebaseAvailable) {
      const updated = questions.filter(q => q.id !== id);
      localStorage.setItem("sbi_clerk_questions", JSON.stringify(updated));
      setQuestions(updated);
    } else {
      const docRef = doc(db, "questions", id);
      await deleteDoc(docRef);
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  }

  // Admin Bulk Upload
  async function bulkUpload(qList) {
    if (!isFirebaseAvailable) {
      let startId = questions.length + 1;
      const mapped = qList.map(q => ({ ...q, id: startId++ }));
      const updated = [...questions, ...mapped];
      localStorage.setItem("sbi_clerk_questions", JSON.stringify(updated));
      setQuestions(updated);
    } else {
      const batchChunks = [];
      for (let i = 0; i < qList.length; i += 400) {
        batchChunks.push(qList.slice(i, i + 400));
      }
      for (const chunk of batchChunks) {
        const batch = writeBatch(db);
        chunk.forEach((q) => {
          const docRef = doc(collection(db, "questions"));
          batch.set(docRef, q);
        });
        await batch.commit();
      }
      // Re-fetch questions to keep state fresh
      const qCollection = collection(db, "questions");
      const qSnapshot = await getDocs(qCollection);
      setQuestions(qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  }

  // ---------------------------------------------------------------------------
  // EXAM ENGINE GENERATOR UTILITIES
  // ---------------------------------------------------------------------------

  // Fisher-Yates shuffle helper
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // General random question selector satisfying constraints
  function selectQuestions(pool, count, easyLimit, medLimit, hardLimit) {
    const easyPool = pool.filter(q => q.difficulty === "Easy");
    const medPool = pool.filter(q => q.difficulty === "Medium");
    const hardPool = pool.filter(q => q.difficulty === "Hard");

    const shuffledEasy = shuffleArray(easyPool);
    const shuffledMed = shuffleArray(medPool);
    const shuffledHard = shuffleArray(hardPool);

    const result = [];
    
    // Attempt to fill quotas
    const selectedEasy = shuffledEasy.slice(0, easyLimit);
    const selectedMed = shuffledMed.slice(0, medLimit);
    const selectedHard = shuffledHard.slice(0, hardLimit);

    result.push(...selectedEasy, ...selectedMed, ...selectedHard);

    // In case target is not reached (e.g. pool is small), fill with remaining questions
    if (result.length < count) {
      const currentIds = new Set(result.map(q => q.id));
      const remainingPool = shuffleArray(pool.filter(q => !currentIds.has(q.id)));
      result.push(...remainingPool.slice(0, count - result.length));
    }

    return result.slice(0, count);
  }

  // 1. Full SBI Mock Test Generator (130 Questions, 120 Minutes)
  function generateMockTest() {
    // Requirements:
    // English: 30 Qs (12 Easy, 12 Med, 6 Hard)
    // Numerical: 35 Qs (14 Easy, 14 Med, 7 Hard)
    // Reasoning: 35 Qs (14 Easy, 14 Med, 7 Hard)
    // GA: 20 Qs (8 Easy, 8 Med, 4 Hard)
    // Computer: 10 Qs (4 Easy, 4 Med, 2 Hard)
    
    const sectionsConfig = [
      { name: "English Language", count: 30, easy: 12, med: 12, hard: 6 },
      { name: "Numerical Ability", count: 35, easy: 14, med: 14, hard: 7 },
      { name: "Reasoning Ability", count: 35, easy: 14, med: 14, hard: 7 },
      { name: "General Awareness", count: 20, easy: 8, med: 8, hard: 4 },
      { name: "Computer Knowledge", count: 10, easy: 4, med: 4, hard: 2 }
    ];

    let testQuestions = [];

    sectionsConfig.forEach(section => {
      const sectionPool = questions.filter(q => q.section === section.name);
      const selected = selectQuestions(sectionPool, section.count, section.easy, section.med, section.hard);
      testQuestions.push(...selected);
    });

    // Randomize question options
    return testQuestions.map(q => {
      const options = [
        { label: "A", text: q.optionA },
        { label: "B", text: q.optionB },
        { label: "C", text: q.optionC },
        { label: "D", text: q.optionD }
      ];
      const shuffledOptions = shuffleArray(options);
      
      // Map back option names but preserve logic
      // To keep it simple, we can keep the original A/B/C/D mapping but present them shuffled, 
      // or just preserve option text matching the correct answer. Let's return option text 
      // mapping so they are randomized, but correct option is still easily matching option text.
      // A cleaner way is to keep labels standard A,B,C,D but shuffle options text, and update correctAnswer.
      const correctText = q.correctAnswer === "A" ? q.optionA : q.correctAnswer === "B" ? q.optionB : q.correctAnswer === "C" ? q.optionC : q.optionD;
      
      const newOptionA = shuffledOptions[0].text;
      const newOptionB = shuffledOptions[1].text;
      const newOptionC = shuffledOptions[2].text;
      const newOptionD = shuffledOptions[3].text;

      let newCorrect = "A";
      if (newOptionB === correctText) newCorrect = "B";
      else if (newOptionC === correctText) newCorrect = "C";
      else if (newOptionD === correctText) newCorrect = "D";

      return {
        ...q,
        optionA: newOptionA,
        optionB: newOptionB,
        optionC: newOptionC,
        optionD: newOptionD,
        correctAnswer: newCorrect
      };
    });
  }

  // 2. Practice Mode generator (Custom selections)
  function generatePracticeTest(section, topic, difficulty, count) {
    let pool = questions;
    if (section && section !== "All") pool = pool.filter(q => q.section === section);
    if (topic && topic !== "All") pool = pool.filter(q => q.topic === topic);
    if (difficulty && difficulty !== "All") pool = pool.filter(q => q.difficulty === difficulty);

    const shuffled = shuffleArray(pool);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // 3. AI Improvement Test (20 questions focused on weak areas)
  function generateAIImprovementTest(weakTopics) {
    if (!weakTopics || weakTopics.length === 0) {
      // Fallback: mixed bank
      return shuffleArray(questions).slice(0, 20);
    }

    const pool = questions.filter(q => weakTopics.includes(q.topic));
    const shuffled = shuffleArray(pool);
    
    let result = shuffled.slice(0, 20);
    if (result.length < 20) {
      // Fill remaining with random questions from same sections
      const currentIds = new Set(result.map(q => q.id));
      const sectionNames = Array.from(new Set(pool.map(q => q.section)));
      
      const fallbackPool = shuffleArray(questions.filter(q => sectionNames.includes(q.section) && !currentIds.has(q.id)));
      result.push(...fallbackPool.slice(0, 20 - result.length));
    }
    return result.slice(0, 20);
  }

  // 4. Daily Challenge (20 random questions, mixed sections & difficulty)
  function generateDailyChallenge() {
    const shuffled = shuffleArray(questions);
    return shuffled.slice(0, 20);
  }

  // Get unique topics per section (for drop-down filters)
  function getTopicsBySection(section) {
    const sectionPool = section && section !== "All" 
      ? questions.filter(q => q.section === section) 
      : questions;
    return Array.from(new Set(sectionPool.map(q => q.topic)));
  }

  const value = {
    questions,
    loading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    bulkUpload,
    generateMockTest,
    generatePracticeTest,
    generateAIImprovementTest,
    generateDailyChallenge,
    getTopicsBySection
  };

  return (
    <DatabaseContext.Provider value={value}>
      {!loading && children}
    </DatabaseContext.Provider>
  );
}
