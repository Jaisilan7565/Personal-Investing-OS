import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import DailyJournal from "./components/DailyJournal/DailyJournal";
import DecisionLog from "./components/DecisionLog/DecisionLog";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import {
  initialJournalEntries,
  initialDecisions,
  metricsData,
} from "./data/mockData";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("investorOS_auth") === "true";
  });
  const [authMode, setAuthMode] = useState("signin");

  const handleSignIn = () => {
    setIsAuthenticated(true);
    localStorage.setItem("investorOS_auth", "true");
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
    localStorage.setItem("investorOS_auth", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("investorOS_auth");
  };
  
  // Theme state: default to 'dark' for Investor-OS default look
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("investorOS_theme") || "dark";
  });

  // Synchronize theme with DOM element and local storage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("investorOS_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Initialize state from localStorage or fall back to mock data
  const [journals, setJournals] = useState(() => {
    const stored = localStorage.getItem("investorOS_journals");
    return stored ? JSON.parse(stored) : initialJournalEntries;
  });

  const [decisions, setDecisions] = useState(() => {
    const stored = localStorage.getItem("investorOS_decisions");
    return stored ? JSON.parse(stored) : initialDecisions;
  });

  // Persist state on change
  useEffect(() => {
    localStorage.setItem("investorOS_journals", JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem("investorOS_decisions", JSON.stringify(decisions));
  }, [decisions]);

  // Calculate dynamic stats based on latest data for the dashboard
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            decisions={decisions}
            journals={journals}
            metricsData={metricsData}
            setActiveTab={setActiveTab}
            theme={theme}
          />
        );
      case "journal":
        return <DailyJournal journals={journals} setJournals={setJournals} />;
      case "decisions":
        return (
          <DecisionLog decisions={decisions} setDecisions={setDecisions} />
        );
      default:
        return (
          <Dashboard
            decisions={decisions}
            journals={journals}
            metricsData={metricsData}
            setActiveTab={setActiveTab}
            theme={theme}
          />
        );
    }
  };

  if (!isAuthenticated) {
    if (authMode === "signin") {
      return (
        <SignIn
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => setAuthMode("signup")}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      );
    } else {
      return (
        <SignUp
          onSignUp={handleSignUp}
          onSwitchToSignIn={() => setAuthMode("signin")}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      );
    }
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      theme={theme}
      toggleTheme={toggleTheme}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
