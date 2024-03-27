import { useState } from 'react'
import * as XLSX from 'xlsx';
import Question from './Question';

function App() {
  const [items, setItems] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showCorrectVariant, setShowCorrectVariant] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });
  const [quizOver, setQuizOver] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);

  const currentQuestion = items[currentQuestionIndex];

  const nextQuestion = () => {
    setShowCorrectVariant(true);
    const correctAnswers = currentQuestion.variants.filter(variant => variant.correct).map(variant => variant.text);
    const answeredCorrectly = selectedOptions.filter(option => correctAnswers.includes(option)).length;
    const totalCorrectVariants = currentQuestion.answers.length;
    let iAmCorrect = false;
    if (answeredCorrectly === totalCorrectVariants && selectedOptions.length === totalCorrectVariants) {
      iAmCorrect = true;
      setStats(prevStats => ({
        correct: prevStats.correct + 1,
        incorrect: prevStats.incorrect,
        skipped: prevStats.skipped
      }));
    } else {
      setIncorrectAnswers(prev => ([...prev, items[currentQuestionIndex]]));
      setStats(prevStats => ({
        correct: prevStats.correct,
        incorrect: prevStats.incorrect + 1,
        skipped: prevStats.skipped
      }));
    }

    const timer = iAmCorrect ? 0 : 3000;

    setTimeout(() => {
      setShowCorrectVariant(false);
      setSelectedOptions([]);
      if (currentQuestionIndex < items.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizOver(true);
      }
    }, timer);
  };

  const handleTakeAgain = () => {
    setStats({ correct: 0, incorrect: 0, skipped: 0 });
    setSelectedOptions([]);
    setIncorrectAnswers([]);
    setCurrentQuestionIndex(0);
    const itemsCopy = [...items];
    const reshuffledAnswersArr = shuffleArray(itemsCopy.map(i => ({ ...i, variants: shuffleArray(i.variants) })));
    setItems(reshuffledAnswersArr);
    setQuizOver(false);
  }

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < items.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStats(prevStats => ({
        correct: prevStats.correct,
        incorrect: prevStats.incorrect,
        skipped: prevStats.skipped + 1
      }));
    } else {
      setQuizOver(true);
    }
  }

  const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: 'buffer' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      const filteredD = d.filter(dataItem => !dataItem.answers.includes('?'));
      let mappedVars = filteredD.map(dataItem => ({ ...dataItem, variants: shuffleArray(dataItem.variants.split('\n')), answers: [...dataItem.answers] }));
      mappedVars.sort((a, b) => a.qnum - b.qnum);
      const mappedVars2 = mappedVars.map(i => ({ ...i, variants: i.variants.map(v => ({ correct: i.answers.includes(v.charAt(0)), text: v })) }));
      const mappedVars3 = shuffleArray(mappedVars2);
      setItems(mappedVars3);
    });
  };

  return (
    <>
      <div className="row-between">
        <div>Hello Misha</div>
      </div>
      <div>
        Questions: {items.length}, Correct: {stats.correct}, Incorrect: {stats.incorrect}
        {stats.skipped > 0 && <span>, Skipped: {stats.skipped}</span>}
      </div>

      <div>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            readExcel(file);
          }}
        />

        {items.length > 0 && <div>
          {!quizOver ? (
            <>
              <Question
                currentQuestion={currentQuestion}
                nextQuestion={nextQuestion}
                showCorrectVariant={showCorrectVariant}
                selectedOptions={selectedOptions}
                handleSkipQuestion={handleSkipQuestion}
                displayButtons={true}
                setSelectedOptions={setSelectedOptions}>
              </Question>
            </>
          ) : (
            <>
              <div>Quiz is over. Final Score: Correct: {stats.correct}, Incorrect: {stats.incorrect}</div>
              <button onClick={handleTakeAgain}>Take again</button>
            </>
          )}
        </div>}

        {/* <pre>{JSON.stringify(items, null, 2)}</pre> */}
        {incorrectAnswers.length > 0 && quizOver && <div className='row-centered'>Your incorrect answers:</div>}
        {incorrectAnswers.length > 0 && quizOver && incorrectAnswers.map(ans => (<div key={ans.qnum}>
          <Question
            currentQuestion={ans}
            nextQuestion={nextQuestion}
            showCorrectVariant={true}
            selectedOptions={selectedOptions}
            handleSkipQuestion={handleSkipQuestion}
            displayButtons={false}
            setSelectedOptions={setSelectedOptions}>
          </Question>
        </div>))}
      </div>
    </>
  )
}

export default App
