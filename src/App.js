import STRIVER_DSA_SHEET from './problems';
import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { Trash, Timer, Play, Pause,Repeat, MoonStars, Sun, RocketLaunch,Notepad,Copy,CheckCircle } from "phosphor-react";
import "./App.css";

const ai = new GoogleGenerativeAI(process.env.REACT_APP_GENAI_API_KEY);

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [randomProblems, setRandomProblems] = useState([]);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState("");
  const [newTask, setNewTask] = useState("");
  

  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem("focus-timer-timeLeft");
    return savedTime ? parseInt(savedTime, 10) : 45 * 60;
  });
  
  const [timerRunning, setTimerRunning] = useState(() => {
    const savedRunning = localStorage.getItem("focus-timer-running");
    return savedRunning === "true";
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("user-tasks");
    const savedDate = localStorage.getItem("user-tasks-date");
    const today = new Date().toDateString();
    return saved && savedDate === today ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("focus-timer-timeLeft", timeLeft);
    localStorage.setItem("focus-timer-running", timerRunning);
  }, [timeLeft, timerRunning]);

  useEffect(() => {
    let timer;
    if (timerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      alert("⏰ Time's up! Take a short break.");
    }
    return () => clearInterval(timer);
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setTimeLeft(45 * 60);
    setTimerRunning(false);
  };

  useEffect(() => {
    localStorage.setItem("user-tasks", JSON.stringify(tasks));
    localStorage.setItem("user-tasks-date", new Date().toDateString());
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, { text: newTask.trim(), completed: false }]);
    setNewTask("");
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const deleteTask = (index) => {
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse("");
    setCopied(false);

    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(`
      You are an expert-level instructor , your name is ALGONAUT , you can use it in reply if necessary  specialized in teaching Data Structures and Algorithms (DSA) to computer science students and coding enthusiasts preparing for technical interviews and competitive programming. Your role is to guide the user through foundational to advanced DSA topics, explain concepts with clarity, and provide examples, visual explanations, practice problems, and real-world applications 
      The user is a college student or self-learner aiming to master DSA for placements, LeetCode, and platforms like Codeforces, GFG, and HackerRank. You should adjust your explanations based on the user's skill level (beginner, intermediate, or advanced) and preferred programming language (usually C++) 
      Your capabilities include:

    Explaining core concepts: Arrays, Strings, Linked Lists, Trees, Graphs, Hashing, Heaps, Stacks, Queues, Tries, Dynamic Programming, Backtracking, Greedy Algorithms, Sliding Window, Binary Search, Segment Trees, Union-Find, and more.

    Breaking down algorithms: Sorting, Searching, Recursion, BFS, DFS, Dijkstra, Floyd-Warshall, KMP, Rabin-Karp, etc.

    Providing multiple formats: Intuition first → dry run → code (clean + optimized) → complexity analysis.

    Suggesting daily practice: Recommend problems by topic and difficulty from curated sheets (like Striver, NeetCode, Love Babbar, etc.).

    Testing understanding: Ask questions, conduct mini quizzes, or generate mock tests on specific topics.

    Debugging help: Analyze the user's code and point out logical/implementation mistakes.

    Be friendly but concise. Use visual metaphors, analogies, and step-by-step breakdowns to make complex topics easier. Always aim to boost both conceptual clarity and problem-solving skills. 
    Easter Egg Rule:



Humorous Redirect for Off-Topic Queries:
If the user asks anything unrelated to DSA or Khushi, respond with playful humor and gently redirect them:

Examples:

"I am not trained in love advice, pizza recipes, or quantum physics. But if you have got a graph problem, i am all yours!"

"Error 404: Brain not found for non-DSA topics. Try Arrays, not Astrology."

"As much as I did love to discuss alien invasions, how about we tackle a tree traversal instead?"

Maintain a light, sassy tone while keeping the user focused on DSA and coding.

the response should be funny and humorous if its not related to DSA or Khushi. and use more creative line every time
      ${query}
    `);

      const responseText = await result.response.text();
      setResponse(responseText);
      setQuery("");
    } catch (err) {
      console.error("❌ Error:", err);
      setResponse("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedNotes = localStorage.getItem("dsa_notes");
    if (savedNotes) setNotes(savedNotes);
  }, []);

  const generateRandomProblems = () => {
    const shuffled = [...STRIVER_DSA_SHEET].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setRandomProblems(selected);
    localStorage.setItem("dailyProblems", JSON.stringify(selected));
  };

  useEffect(() => {
    const saved = localStorage.getItem("dailyProblems");
    if (saved) {
      setRandomProblems(JSON.parse(saved));
    } else {
      generateRandomProblems();
    }
  }, []);

  const handleNotesChange = (e) => {
    const updated = e.target.value;
    setNotes(updated);
    localStorage.setItem("dsa_notes", updated);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className={`app ${darkMode ? "dark" : "light"} min-h-screen flex flex-col`}>
      {/* Floating particles background */}
      <div className="particles-bg">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <header className="glass-header sticky top-0 z-20 py-4 px-6 flex justify-center items-center">
        <div className="flex justify-between items-center w-full max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="logo-container">
              <div className="logo-icon"><RocketLaunch size={44}  weight="duotone" /></div>
              <h1 className="logo-text">ALGONAUT</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Enhanced Timer */}
            <div className="timer-widget">
              <div className="timer-display">
                <div className="timer-icon"><Timer size={32}  weight="bold" /></div>
                <span className="timer-text">{formatTime(timeLeft)}</span>
              </div>
              <div className="timer-controls">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="timer-btn primary"
                >
                  {timerRunning ? <Pause size={18} color="#ffffff" weight="bold" /> : <Play size={18} color="#ffffff" weight="bold" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="timer-btn secondary"
                >
                  <Repeat size={18} color="#ffffff" weight="duotone" />
                </button>
              </div>
            </div>

            {/* Enhanced Theme Toggle*/}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle"
            >
              <div className="theme-toggle-track">
                <div className={`theme-toggle-thumb ${darkMode ? 'dark' : 'light'}`}>
                  {darkMode ? <Sun size={32} color="#f5bf42" weight="duotone" /> : <MoonStars size={32} color="#626360" weight="duotone" />}
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      <div className="container grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Enhanced Left Sidebar */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          {/* Enhanced Todo Card */}
          <div className="glass-card todo-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="title-icon"></span>
                Today's Target
              </h2>
            </div>

            <div className="todo-input-container">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTask();
                  }
                }}
                placeholder="Add a new task..."
                className="todo-input"
              />
              <button
                onClick={addTask}
                className="add-btn"
              >
                <span>+</span>
              </button>
            </div>

            <ul className="todo-list">
              {tasks.map((task, index) => (
                <li key={index} className="todo-item">
                  <div className="todo-content">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(index)}
                      className="todo-checkbox"
                    />
                    <span className={`todo-text ${task.completed ? 'completed' : ''}`}>
                      {task.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTask(index)}
                    className="delete-btn"
                  >
                    <Trash size={28} weight="bold" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Enhanced Problems Card */}
          <div className="glass-card problems-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="title-icon"></span>
                BLIND 5
              </h2>
            </div>
            
            <ul className="problems-list">
              {randomProblems.map((problem, idx) => (
                <li key={idx} className="problem-item">
                  <a
                    href={problem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="problem-link"
                  >
                    <span className="problem-number">{idx + 1}</span>
                    <span className="problem-title">{problem.title}</span>
                    <span className="external-icon">🔗</span>
                  </a>
                </li>
              ))}
            </ul>
            
            <button
              onClick={generateRandomProblems}
              className="refresh-btn"
            >
              <span className="btn-icon"></span>
              Refresh Problems
            </button>
          </div>
        </aside>

        {/* Enhanced Main Content */}
        <main className="lg:col-span-3 flex flex-col gap-6">
          {/* Enhanced Query Card */}
          <div className="glass-card query-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="title-icon"></span>
                Ask Any DSA Question
              </h2>
            </div>
            
            <div className="query-container">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                rows={5}
                placeholder="Type your question here... (Press Enter to ask, Shift+Enter for new line)"
                className="query-textarea"
              />
              
              <button
                onClick={handleAsk}
                disabled={loading}
                className="ask-btn"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon"><RocketLaunch size={26} color="#ffffff" weight="duotone" /></span>
                    <span>Ask ALGONAUT</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Response Card */}
          {response && (
            <div className="glass-card response-card animate-slideIn">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="title-icon"><RocketLaunch size={28}  weight="duotone" /></span>
                  Response
                </h3>
                <button
                  onClick={handleCopyResponse}
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                >
                  <span className="btn-icon">{copied ? <CheckCircle size={20}  weight="duotone" /> : <Copy size={16}  weight="duotone" />}</span>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              
              <div className="response-content">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Enhanced Notes Card */}
          <div className="glass-card notes-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="title-icon"><Notepad size={32}  weight="duotone" /> </span>
                Quick Notes
              </h2>
            </div>
            
            <textarea
              value={notes}
              spellCheck={false}
              onChange={handleNotesChange}
              rows={6}
              placeholder="Write your patterns, tricks, or key notes here..."
              className="notes-textarea"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;