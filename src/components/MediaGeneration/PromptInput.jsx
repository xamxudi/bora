import './PromptInput.css';

export default function PromptInput({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  showNegative
}) {

  return (
    <div className="prompt-container">
      {/* Prompt */}
      <div className="prompt-section">
        <textarea class="prompt-input" style={{border: "unset", resize: "none"}}
         placeholder="Nhập yêu cầu của bạn..."   
         value={prompt}
         onChange={(e) => setPrompt(e.target.value)}
         rows="3" />
      </div>

      {/* Negative Prompt */}
      {showNegative && (
        <div className="prompt-section">
          <input
            style={{border: "unset", margin: "8px 0"}}
            type="text"
            className="prompt-input"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Enter negative prompts..."
          />
        </div>
      )}
    </div>
  );
}
