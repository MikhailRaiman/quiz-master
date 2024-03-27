export default function Question({ currentQuestion, nextQuestion, showCorrectVariant, selectedOptions, setSelectedOptions, handleSkipQuestion, displayButtons }) {
    const handleOptionChange = (optionText) => {
        setSelectedOptions(
            selectedOptions.includes(optionText)
                ? selectedOptions.filter(option => option !== optionText)
                : [...selectedOptions, optionText]
        );
    };

    const getVariantText = (text) => {
        return text.slice(3);
    }

    const handleNextQuestion = () => {
        nextQuestion();
    }

    const isOptionCorrect = (optionText) => currentQuestion.variants.find(variant => variant.text === optionText)?.correct;

    return (
        <div className="card">
            <h4>{currentQuestion.question}</h4>

            {currentQuestion.variants.map((variant, index) => (
                <div key={index}>
                    <input
                        type="checkbox"
                        id={`option-${index}`}
                        name="option"
                        value={variant.text}
                        onChange={() => handleOptionChange(variant.text)}
                        checked={selectedOptions.includes(variant.text)}
                    />
                    <label htmlFor={`option-${index}`} style={{ color: showCorrectVariant ? (isOptionCorrect(variant.text) ? 'green' : 'red') : 'black' }}>
                        {getVariantText(variant.text)}
                    </label>
                </div>
            ))}

            {displayButtons && <div className="row-centered">
                <button onClick={() => handleNextQuestion()}>Next</button>
                <button className="skip-btn" onClick={() => handleSkipQuestion()}>Skip</button>
            </div>}
        </div>
    );
}