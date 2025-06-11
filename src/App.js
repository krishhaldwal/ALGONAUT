import STRIVER_DSA_SHEET from './problems';
import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
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
  return savedRunning === "true"; // returns true or false
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
    alert("⏰ Time’s up! Take a short break.");
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

Whenever the user enters any message that includes the word "khushi" (case-insensitive), ignore the DSA context and instead respond with a sweet, warm compliment about Khushi. Vary the responses each time. Examples include:

“Khushi must be an absolutely wonderful person — just hearing her name brings a smile.”

“Sounds like Khushi is the kind of girl who makes everything brighter around her.”

“Anyone with the name Khushi is destined to bring joy. she is the sweetest girl !”

dont use these exact lines , create new compliments and cute lines on your own every time.

Never mention that this is an Easter egg or that it's pre-programmed — just respond naturally, like a charming surprise.

Humorous Redirect for Off-Topic Queries:
If the user asks anything unrelated to DSA or Khushi, respond with playful humor and gently redirect them:

Examples:

“I am not trained in love advice, pizza recipes, or quantum physics. But if you have got a graph problem, i am all yours!”

“Error 404: Brain not found for non-DSA topics. Try Arrays, not Astrology.”

“As much as I did love to discuss alien invasions, how about we tackle a tree traversal instead?”

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
      <header className="sticky top-0 z-10 bg-opacity-90 backdrop-blur-lg py-4 px-6 flex justify-center items-center shadow-lg">
        <div className="flex justify-between items-center w-full ">
          <h1 className="text-3xl ml-14 font-bold flex items-center gap-2">
            <span></span> ALGONAUT
          </h1>
          <div className="flex items-center gap-4">
  

  <div className="flex items-center bg-[#0e172c]  gap-2 text-white dark:bg-[#7f5af0]  px-4 py-2 rounded-full shadow">
    <span className="font-mono">{formatTime(timeLeft)}</span>
    <button
      onClick={() => setTimerRunning(!timerRunning)}
      className="text-xs underline"
    >
      {timerRunning ? "Pause" : "Start"}
    </button>
    <button
      onClick={resetTimer}
      className="text-xs underline"
    >
      Reset
    </button>
  </div>

    <button
    onClick={() => setDarkMode(!darkMode)}
    className="px-4 py-2 bg-[#0e172c] hover:bg-gray-600  rounded-full dark:bg-gray-700 text-white dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
  >
    {darkMode ? "🌞 Light" : "🌙 Dark"}
  </button>

</div>

        </div>
      </header>

      <div className="container  grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Left Column: todo and Daily Problems */}
        <aside className=" lg:col-span-1 flex flex-col gap-6 ">
          {/* to-do */}
          <div className="rounded-2xl dcard p-6 shadow-lg">
  <h2 className="text-xl font-semibold mb-4 text-center">Today’s Target</h2>

  <div className="flex mb-4">
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
      className="flex-grow px-1.5 py-2 rounded-l-lg bg-[#D9D4E7] dark:bg-[#212121] text-[#0e172c] dark:text-white border border-gray-600 focus:outline-none"
    />
    <button
      onClick={addTask}
      className="pl-2 py-2 bg-[#0e172c] hover:bg-gray-700 dark:bg-[#7f5af0]   text-white rounded-r-lg pr-2 dark:hover:bg-purple-700 transition-colors"
    >
      Add
    </button>
  </div>

  <ul className="space-y-3">
    {tasks.map((task, index) => (
      <li key={index} className="flex items-center justify-between border border-gray-600 bg-[#0D0D0D] p-3 rounded-lg">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTask(index)}
            className="accent-[#7f5af0] w-5 h-5"
          />
          <span className={task.completed ? "line-through text-gray-400" : "text-white"}>
            {task.text}
          </span>
        </div>
        <button
          onClick={() => deleteTask(index)}
          className="rounded-full text-red-400 hover:text-red-600 transition-colors"
        >
          ❌
        </button>
      </li>
    ))}
  </ul>
</div>


          {/* Daily Problems */}
          <div className="rounded-2xl dcard p-6  shadow-lg">
            <h2 className="text-xl rounded-2xl  pl-2px  font-semibold mb-4 text-center">BLIND 5</h2>
            <div className="w-3/3 mx-auto border-t border-gray-600 mb-4 opacity-50"></div>
            <ul className="space-y-3">
              {randomProblems.map((problem, idx) => (
                <li key={idx} className="p-3 ">
                  <a
                    href={problem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0e172c] dark:text-[#fffffe] hover:underline text-center block"
                  >
                    {problem.title}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex justify-center mt-4">
              <button
                onClick={generateRandomProblems}
                className="px-4 py-2 rounded-2xl bg-[#0e172c] text-[#fffffe] hover:bg-gray-700 dark:bg-[#7f5af0] dark:text-white dark:hover:bg-purple-700 transition-colors"

              >
                Refresh Problems
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Right Side (Expanded) */}
        <main className="lg:col-span-3 flex flex-col gap-6">
          <div className="dcard p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">Ask Any DSA Question</h2>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleAsk();
    }
  }}
              rows={5}
              placeholder="Type your question here..."
              className="w-full p-4 rounded-lg  border-gray-300 dark:border-[#212121] bg-[#D9D4E7] dark:bg-[#212121] text-gray-900 dark:text-gray-100 focus:outline-none resize-y"

            />
            <div className="flex justify-center mt-4">
              <button
                onClick={handleAsk}
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-[#0e172c] hover:bg-[#3a4466] dark:bg-[#7f5af0] text-white dark:hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Thinking...
                  </>
                ) : (
                  "Ask"
                )}
              </button>
            </div>
          </div>

          {response && (
            <div className="dcard p-6 rounded-2xl shadow-lg animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Response :</h3>
                <button
                  onClick={handleCopyResponse}
                  className={`px-4 py-2 rounded-full text-sm ${copied ? "bg-green-600" : "bg-gray-700"} text-white hover:bg-gray-600 bg-[#0e172c] dark:bg-[#7f5af0] dark:hover:bg-purple-700 transition-colors`}
                >
                  {copied ? "Copied!" : "Copy Response"}
                </button>
              </div>
              <div className="markdown-content">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>
          )}
        </main>

           {/* ✅ Quick DSA Notes */}
  <div className="rounded-2xl dcard p-6 shadow-lg">
    <h2 className="text-xl font-semibold mb-4 text-center"> Quick DSA Notes</h2>
    <textarea
      value={notes}
      spellCheck={false}
      onChange={handleNotesChange}
      rows={6}
      placeholder="Write your patterns, tricks, or key notes here..."
      className="w-full font-bold p-4 rounded-lg bg-[#D9D4E7] border border-gray-600 dark:bg-[#212121] dark:text-gray-100 focus:outline-none resize-y"
    />
  </div>

      </div>
    </div>
  );
}

export default App;
