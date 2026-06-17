import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, isFirebaseAvailable } from "../config/firebase";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Local User Database if in fallback mode
  useEffect(() => {
    if (!isFirebaseAvailable) {
      const storedUsers = localStorage.getItem("sbi_clerk_users");
      let users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Seed default accounts if empty
      const hasStandard = users.some(u => u.email === "candidate@gmail.com");
      const hasAdmin = users.some(u => u.email === "admin@sbi.com");
      
      if (!hasStandard || !hasAdmin) {
        if (!hasStandard) {
          users.push({
            uid: "candidate_uid",
            email: "candidate@gmail.com",
            password: "password123", // in mock we keep plain text
            displayName: "Vidya Kamble",
            isAdmin: false,
            createdAt: new Date().toISOString(),
            stats: {
              totalTestsAttempted: 3,
              bestScore: 88.5,
              averageScore: 78.2,
              averageAccuracy: 82.5,
              averageTimePerQuestion: 45.5,
              strongestSubject: "Reasoning Ability",
              weakestSubject: "English Language",
              streak: { current: 3, longest: 5, lastActiveDate: new Date().toISOString() },
              achievements: ["first_test", "streak_3"]
            },
            testHistory: [
              {
                testId: "test_seed_1",
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                type: "Mock Test",
                score: 75.0,
                accuracy: 80.0,
                timeTaken: 5400,
                sections: {
                  "English Language": { attempted: 22, correct: 18, wrong: 4, timeSpent: 1000 },
                  "Numerical Ability": { attempted: 30, correct: 25, wrong: 5, timeSpent: 1800 },
                  "Reasoning Ability": { attempted: 32, correct: 28, wrong: 4, timeSpent: 1600 },
                  "General Awareness": { attempted: 15, correct: 10, wrong: 5, timeSpent: 700 },
                  "Computer Knowledge": { attempted: 8, correct: 6, wrong: 2, timeSpent: 300 }
                },
                wrongTopics: ["Simplification", "Error Detection", "Operating System"]
              },
              {
                testId: "test_seed_2",
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                type: "Practice Mode",
                score: 81.2,
                accuracy: 85.0,
                timeTaken: 1200,
                sections: {
                  "Numerical Ability": { attempted: 15, correct: 13, wrong: 2, timeSpent: 600 },
                  "Reasoning Ability": { attempted: 15, correct: 14, wrong: 1, timeSpent: 600 }
                },
                wrongTopics: ["Number Series"]
              }
            ]
          });
        }
        if (!hasAdmin) {
          users.push({
            uid: "admin_uid",
            email: "admin@sbi.com",
            password: "adminpassword",
            displayName: "SBI Exam Administrator",
            isAdmin: true,
            createdAt: new Date().toISOString(),
            stats: { totalTestsAttempted: 0, bestScore: 0, averageScore: 0, averageAccuracy: 0, averageTimePerQuestion: 0, strongestSubject: "N/A", weakestSubject: "N/A", streak: { current: 0, longest: 0, lastActiveDate: "" }, achievements: [] },
            testHistory: []
          });
        }
        localStorage.setItem("sbi_clerk_users", JSON.stringify(users));
      }

      // Check for logged-in user session
      const activeUser = localStorage.getItem("sbi_clerk_active_user");
      if (activeUser) {
        let parsed = JSON.parse(activeUser);
        if (parsed.displayName === "Rahul Sharma") {
          parsed.displayName = "Vidya Kamble";
          localStorage.setItem("sbi_clerk_active_user", JSON.stringify(parsed));
          
          // also update in users array
          const storedUsers = localStorage.getItem("sbi_clerk_users");
          if (storedUsers) {
            let users = JSON.parse(storedUsers);
            const idx = users.findIndex(u => u.uid === parsed.uid);
            if (idx > -1) {
              users[idx].displayName = "Vidya Kamble";
              localStorage.setItem("sbi_clerk_users", JSON.stringify(users));
            }
          }
        }
        setCurrentUser(parsed);
      }
      setLoading(false);
    } else {
      // Firebase standard auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch additional profile fields from Firestore
          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userSnap = await getDoc(userDocRef);
            
            if (userSnap.exists()) {
              setCurrentUser({ ...firebaseUser, ...userSnap.data() });
            } else {
              // Create user record in Firestore if missing
              const defaultProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || "Candidate",
                isAdmin: firebaseUser.email === "admin@sbi.com",
                createdAt: new Date().toISOString(),
                stats: {
                  totalTestsAttempted: 0,
                  bestScore: 0,
                  averageScore: 0,
                  averageAccuracy: 0,
                  averageTimePerQuestion: 0,
                  strongestSubject: "N/A",
                  weakestSubject: "N/A",
                  streak: { current: 0, longest: 0, lastActiveDate: "" },
                  achievements: []
                },
                testHistory: []
              };
              await setDoc(userDocRef, defaultProfile);
              setCurrentUser({ ...firebaseUser, ...defaultProfile });
            }
          } catch (error) {
            console.error("Error fetching user data from Firestore:", error);
            // Fallback user structure
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "Candidate",
              isAdmin: firebaseUser.email === "admin@sbi.com",
              stats: { totalTestsAttempted: 0, bestScore: 0, averageScore: 0, averageAccuracy: 0, averageTimePerQuestion: 0, strongestSubject: "N/A", weakestSubject: "N/A", streak: { current: 0, longest: 0, lastActiveDate: "" }, achievements: [] },
              testHistory: []
            });
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  // Login handler
  async function login(email, password) {
    if (!isFirebaseAvailable) {
      const storedUsers = localStorage.getItem("sbi_clerk_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (found) {
        const userSession = { ...found };
        delete userSession.password; // strip password for session
        localStorage.setItem("sbi_clerk_active_user", JSON.stringify(userSession));
        setCurrentUser(userSession);
        return userSession;
      } else {
        throw new Error("Invalid email or password.");
      }
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Let onAuthStateChanged handle setting currentUser
      return userCredential.user;
    }
  }

  // Registration handler
  async function register(email, password, displayName) {
    if (!isFirebaseAvailable) {
      const storedUsers = localStorage.getItem("sbi_clerk_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already registered.");
      }

      const newUser = {
        uid: "user_" + Math.random().toString(36).substr(2, 9),
        email,
        password,
        displayName,
        isAdmin: email.toLowerCase() === "admin@sbi.com",
        createdAt: new Date().toISOString(),
        stats: {
          totalTestsAttempted: 0,
          bestScore: 0,
          averageScore: 0,
          averageAccuracy: 0,
          averageTimePerQuestion: 0,
          strongestSubject: "N/A",
          weakestSubject: "N/A",
          streak: { current: 0, longest: 0, lastActiveDate: "" },
          achievements: []
        },
        testHistory: []
      };

      users.push(newUser);
      localStorage.setItem("sbi_clerk_users", JSON.stringify(users));
      
      const userSession = { ...newUser };
      delete userSession.password;
      localStorage.setItem("sbi_clerk_active_user", JSON.stringify(userSession));
      setCurrentUser(userSession);
      return userSession;
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // Save profile doc to Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const defaultProfile = {
        uid: userCredential.user.uid,
        email,
        displayName,
        isAdmin: email.toLowerCase() === "admin@sbi.com",
        createdAt: new Date().toISOString(),
        stats: {
          totalTestsAttempted: 0,
          bestScore: 0,
          averageScore: 0,
          averageAccuracy: 0,
          averageTimePerQuestion: 0,
          strongestSubject: "N/A",
          weakestSubject: "N/A",
          streak: { current: 0, longest: 0, lastActiveDate: "" },
          achievements: []
        },
        testHistory: []
      };
      await setDoc(userDocRef, defaultProfile);
      setCurrentUser(defaultProfile);
      return userCredential.user;
    }
  }

  // Logout handler
  async function logout() {
    if (!isFirebaseAvailable) {
      localStorage.removeItem("sbi_clerk_active_user");
      setCurrentUser(null);
    } else {
      await signOut(auth);
      setCurrentUser(null);
    }
  }

  // Password reset handler
  async function forgotPassword(email) {
    if (!isFirebaseAvailable) {
      const storedUsers = localStorage.getItem("sbi_clerk_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const found = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        throw new Error("No user found with this email address.");
      }
      // Simulate successful request
      return true;
    } else {
      await sendPasswordResetEmail(auth, email);
    }
  }

  // Save history and update stats
  async function saveTestAttempt(attempt) {
    if (!currentUser) return;

    // Calculate new statistics based on current history + new attempt
    const history = [...(currentUser.testHistory || []), attempt];
    const totalAttempted = history.length;
    
    // Scores
    const scores = history.map(h => h.score);
    const bestScore = Math.max(...scores);
    const averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / totalAttempted) * 10) / 10;
    
    // Accuracy
    const accuracies = history.map(h => h.accuracy);
    const averageAccuracy = Math.round((accuracies.reduce((a, b) => a + b, 0) / totalAttempted) * 10) / 10;

    // Time Spent & Question Speed
    const totalTimeSpent = history.reduce((sum, h) => sum + h.timeTaken, 0);
    // Let's count total answered questions across history
    let totalQuestionsAnswered = 0;
    history.forEach(h => {
      Object.keys(h.sections || {}).forEach(sec => {
        totalQuestionsAnswered += h.sections[sec].attempted || 0;
      });
    });
    const averageTimePerQuestion = totalQuestionsAnswered > 0 
      ? Math.round((totalTimeSpent / totalQuestionsAnswered) * 10) / 10 
      : 0;

    // Streaks Engine
    let currentStreak = currentUser.stats?.streak?.current || 0;
    let longestStreak = currentUser.stats?.streak?.longest || 0;
    const lastActiveDate = currentUser.stats?.streak?.lastActiveDate || "";
    
    const todayStr = new Date().toISOString().split("T")[0];
    if (lastActiveDate !== todayStr) {
      if (lastActiveDate === new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]) {
        currentStreak += 1;
      } else if (lastActiveDate === "") {
        currentStreak = 1;
      } else {
        currentStreak = 1; // broken and restarted
      }
      longestStreak = Math.max(currentStreak, longestStreak);
    }

    // Weakest/Strongest section analyzer
    const sectionTotals = {};
    history.forEach(h => {
      Object.entries(h.sections || {}).forEach(([secName, secMetrics]) => {
        if (!sectionTotals[secName]) {
          sectionTotals[secName] = { correct: 0, attempted: 0 };
        }
        sectionTotals[secName].correct += secMetrics.correct || 0;
        sectionTotals[secName].attempted += secMetrics.attempted || 0;
      });
    });

    let strongestSubject = "N/A";
    let weakestSubject = "N/A";
    let maxAcc = -1;
    let minAcc = 101;

    Object.entries(sectionTotals).forEach(([secName, data]) => {
      if (data.attempted > 5) { // Needs a threshold to determine
        const acc = (data.correct / data.attempted) * 100;
        if (acc > maxAcc) {
          maxAcc = acc;
          strongestSubject = secName;
        }
        if (acc < minAcc) {
          minAcc = acc;
          weakestSubject = secName;
        }
      }
    });

    // Handle standard fallbacks if insufficient data
    if (strongestSubject === "N/A" && history.length > 0) {
      strongestSubject = "Reasoning Ability";
      weakestSubject = "English Language";
    }

    // Achievements system check
    const achievements = [...(currentUser.stats?.achievements || [])];
    if (totalAttempted >= 1 && !achievements.includes("first_test")) achievements.push("first_test");
    if (totalAttempted >= 5 && !achievements.includes("5_tests")) achievements.push("5_tests");
    if (totalAttempted >= 10 && !achievements.includes("10_tests")) achievements.push("10_tests");
    if (totalAttempted >= 50 && !achievements.includes("50_tests")) achievements.push("50_tests");
    if (attempt.accuracy >= 90 && !achievements.includes("accuracy_90")) achievements.push("accuracy_90");
    if (currentStreak >= 7 && !achievements.includes("streak_7")) achievements.push("streak_7");
    if (currentStreak >= 30 && !achievements.includes("streak_30")) achievements.push("streak_30");

    const updatedStats = {
      totalTestsAttempted: totalAttempted,
      bestScore,
      averageScore,
      averageAccuracy,
      averageTimePerQuestion,
      strongestSubject,
      weakestSubject,
      streak: { current: currentStreak, longest: longestStreak, lastActiveDate: todayStr },
      achievements
    };

    const updatedUser = {
      ...currentUser,
      stats: updatedStats,
      testHistory: history
    };

    if (!isFirebaseAvailable) {
      const storedUsers = localStorage.getItem("sbi_clerk_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const userIdx = users.findIndex(u => u.uid === currentUser.uid);
      
      if (userIdx > -1) {
        users[userIdx].stats = updatedStats;
        users[userIdx].testHistory = history;
        localStorage.setItem("sbi_clerk_users", JSON.stringify(users));
      }
      localStorage.setItem("sbi_clerk_active_user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    } else {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        stats: updatedStats,
        testHistory: history
      });
      setCurrentUser(updatedUser);
    }
  }

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    saveTestAttempt
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
