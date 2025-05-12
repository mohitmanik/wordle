import { useEffect, useState, useRef } from 'react';
import './App.css';

function App() {
  const [won, setwon] = useState(false);
  const [lose, setLose] = useState(false);
  const [dark, setDark] = useState(false);
  const [box, setBox] = useState(Array(6).fill().map(() => Array(5).fill("")));
  const [styles, setStyles] = useState(Array(6).fill().map(() => Array(5).fill("")));
  const [data, setData] = useState("");
  const [dictionary, setDictionary] = useState([]);
  const inputRefs = useRef(Array.from({ length: 6 }, () => Array(5).fill(null)));

  const [streak, setStreak] = useState(() => {
    const savedStreak = localStorage.getItem("streak");
    return savedStreak ? parseInt(savedStreak) : 0;
  });


  const handleInputChange = (e, rowIndex, colIndex) => {
    const value = e.target.value.toUpperCase().slice(0, 1);
    const newBox = box.map(row => [...row]);
    newBox[rowIndex][colIndex] = value;
    setBox(newBox);

    if (value && colIndex < 4) {
      inputRefs.current[rowIndex][colIndex + 1]?.focus();
    }
  };

  const reset = () => {
    setBox(Array(6).fill().map(() => Array(5).fill("")));
    setStyles(Array(6).fill().map(() => Array(5).fill("")));
    setwon(false);
    setLose(false);

    fetch("http://localhost:8000/data")
      .then(res => res.json())
      .then(json => {
        const index = Math.floor(Math.random() * json.length);
        setData(json[index].toUpperCase());
        console.log("New Word:", json[index]);
      })
      .catch(e => console.error("Error fetching new word:", e));
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    if (e.key === "Backspace" && !e.target.value && colIndex > 0) {
      inputRefs.current[rowIndex][colIndex - 1]?.focus();
    }

    if (e.key === "Enter") {
      const currentWord = box[rowIndex].join("");
      if (currentWord.length < 5 || box[rowIndex].some(c => c === "")) return;

      if (!dictionary.includes(currentWord)) {
        alert("Not a valid word!");
        const newBox = [...box];
        newBox[rowIndex] = Array(5).fill("");
        setBox(newBox);

        const newStyles = [...styles];
        newStyles[rowIndex] = Array(5).fill("");
        setStyles(newStyles);

        inputRefs.current[rowIndex][0]?.focus();
        return;
      }

      const newStyles = styles.map(row => [...row]);
      const letterUsed = Array(5).fill(false);
      const wordArray = data.split("");

      for (let i = 0; i < 5; i++) {
        if (box[rowIndex][i] === data[i]) {
          newStyles[rowIndex][i] = "bg-green-500";
          letterUsed[i] = true;
        }
      }

      for (let i = 0; i < 5; i++) {
        if (box[rowIndex][i] !== data[i]) {
          const idx = wordArray.findIndex((ch, j) => ch === box[rowIndex][i] && !letterUsed[j]);
          if (idx !== -1) {
            newStyles[rowIndex][i] = "bg-yellow-400";
            letterUsed[idx] = true;
          } else {
            newStyles[rowIndex][i] = "bg-gray-300";
          }
        }
      }

      setStyles(newStyles);


      setTimeout(() => {
        if (currentWord === data) {
          setwon(true);
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem("streak", newStreak);
        } else if (rowIndex === 5 && colIndex === 4) {
          setLose(true);
          setStreak(0);
          localStorage.setItem("streak", 0);
        }
      }, 500);

    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/data");
        const json = await res.json();
        const index = Math.floor(Math.random() * json.length);
        setData(json[index].toUpperCase());
        setDictionary(json.map(w => w.toUpperCase()));
      } catch (e) {
        console.error("Error:", e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={dark ? "dark" : ""}>

      {/* Win/Lose Banner */}
      {(won || lose) && (
        <div className="fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-opacity-30 z-50">
          <h1 className={`text-4xl ${dark ? "text-white" : "text-black"}`}>
            {won ? "You win the match!" : "You lose the match!"}
          </h1>
          {lose && <h2 className={`text-2xl mt-2 ${dark ? "text-white" : "text-black"}`}>The word is: {data}</h2>}
          <button onClick={reset} className='bg-green-600 w-32 h-8 rounded mt-4 text-white cursor-pointer'>New Game</button>
        </div>
      )}

      <div className={`min-h-screen ${won || lose ? "blur" : "game-container"} transition-colors duration-300 ${dark ? "bg-gray-900 text-white" : "bg-white text-black"}`}>

        {/* Dark Mode Toggle */}
        <div className="flex justify-end px-6 pt-6">
          <button
            onClick={() => setDark(prev => !prev)}
            className="px-4 py-2 border rounded text-sm font-medium"
          >
            {dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>

        {/* Game Board */}
        <h1 className="text-5xl font-bold text-center mt-10 flex justify-center gap-2">
  <span className="w-14 h-14 flex items-center justify-center bg-green-500 text-white">W</span>
  <span className="w-14 h-14 flex items-center justify-center bg-yellow-400 text-white">O</span>
  <span className="w-14 h-14 flex items-center justify-center bg-gray-300 text-black">R</span>
  <span className="w-14 h-14 flex items-center justify-center bg-blue-400 text-white">D</span>
  <span className="w-14 h-14 flex items-center justify-center bg-purple-500 text-white">L</span>
  <span className="w-14 h-14 flex items-center justify-center bg-pink-400 text-white">E</span>
</h1>

        <div className="text-xl  text-center mt-4">
          Current Streak: <span>{streak}</span>
        </div>

        {/* <h3>{data}</h3> */}
        <div className="flex flex-col items-center mt-10">
          {box.map((row, rowIndex) => (
            <div key={rowIndex} className="flex m-2 gap-2.5">
              {row.map((letter, colIndex) => (
                <input
                  key={colIndex}
                  maxLength={1}
                  value={letter}
                  ref={el => inputRefs.current[rowIndex][colIndex] = el}
                  onChange={e => handleInputChange(e, rowIndex, colIndex)}
                  onKeyDown={e => handleKeyDown(e, rowIndex, colIndex)}
                  className={`w-14 h-14 text-center uppercase font-bold border-2 text-4xl transition-all duration-200
  ${styles[rowIndex][colIndex] || (dark ? "bg-gray-800" : "bg-white")}
  ${dark ? "border-gray-600 text-white" : "border-black text-black"}`}

                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
