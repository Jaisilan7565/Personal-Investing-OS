import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import DailyJournal from "./components/DailyJournal/DailyJournal";
import DecisionLog from "./components/DecisionLog/DecisionLog";
import Strategies from "./components/Strategies/Strategies";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import ToastContainer from "./components/Toast/ToastContainer";
import {
  loginSuccess,
  logoutSuccess,
  toggleTheme as toggleThemeAction,
} from "./store/index.js";
import { journalService } from "./services/journalService";
import { decisionService } from "./services/decisionService";
import { strategyService } from "./services/strategyService";
import { useToast } from "./hooks/useToast";

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const theme = useSelector((state) => state.ui.theme);

  const [journals, setJournals] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSignIn = (token, username) => {
    dispatch(loginSuccess({ token, username }));
    navigate("/");
  };

  const handleSignUp = (token, username) => {
    dispatch(loginSuccess({ token, username }));
    navigate("/");
  };

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate("/signin");
  };

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  // Synchronize theme with DOM element and local storage
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add("disable-transitions");
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const timeoutId = setTimeout(() => {
      root.classList.remove("disable-transitions");
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [theme]);

  // Fetch real-time DB logs upon authentication
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const journalRes = await journalService.getAll(1, 200);
          const decisionRes = await decisionService.getAll(1, 200);
          const strategyRes = await strategyService.getAll(1, 200);
          setJournals(journalRes.data || []);
          setDecisions(decisionRes.data || []);
          setStrategies(strategyRes.data || []);
        } catch (err) {
          console.error("Error loading workspace data from Database:", err);
          toast.error("Failed to load your portfolio journals, decisions, or strategies.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setJournals([]);
      setDecisions([]);
      setStrategies([]);
    }
  }, [isAuthenticated]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-md z-50 flex items-center justify-center flex-col gap-3">
          <div className="w-10 h-10 border-4 border-accent-indigo border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-on-variant uppercase tracking-widest font-mono">
            Synchronizing Workspace...
          </span>
        </div>
      )}

      <Routes>
        {/* PUBLIC ROUTES (Only accessible if logged out) */}
        <Route
          path="/signin"
          element={
            !isAuthenticated ? (
              <SignIn
                onSignIn={handleSignIn}
                onSwitchToSignUp={() => navigate("/signup")}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUp
                onSignUp={handleSignUp}
                onSwitchToSignIn={() => navigate("/signin")}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* PRIVATE ROUTES (Only accessible if logged in) */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout}>
                <Dashboard
                  decisions={decisions}
                  journals={journals}
                  setActiveTab={(tab) => navigate(tab === "dashboard" ? "/" : `/${tab}`)}
                  theme={theme}
                />
              </Layout>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/journal"
          element={
            isAuthenticated ? (
              <Layout theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout}>
                <DailyJournal journals={journals} setJournals={setJournals} />
              </Layout>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/decisions"
          element={
            isAuthenticated ? (
              <Layout theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout}>
                <DecisionLog
                  decisions={decisions}
                  setDecisions={setDecisions}
                  strategies={strategies}
                />
              </Layout>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/strategies"
          element={
            isAuthenticated ? (
              <Layout theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout}>
                <Strategies
                  strategies={strategies}
                  setStrategies={setStrategies}
                  decisions={decisions}
                />
              </Layout>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        {/* CATCH-ALL REDIRECT GUARDS */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/signin"} replace />}
        />
      </Routes>

      <ToastContainer />
    </>
  );
}
