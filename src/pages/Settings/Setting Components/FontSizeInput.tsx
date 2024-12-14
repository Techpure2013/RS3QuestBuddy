import React, { useEffect } from "react";
import { useFontSize } from "./../../../Entrance/Entrance Components/FontContextProvider"; // Assuming a custom hook for font size management

const FontSizeControls: React.FC = () => {
  const { fontSize, setFontSize } = useFontSize();

  useEffect(() => {
    // Load font size from localStorage on component mount
    const savedFontSize = localStorage.getItem("userFontSize");
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
  }, [setFontSize]);

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setFontSize(newSize);
    localStorage.setItem("userFontSize", newSize.toString());
  };

  return (
    <div>
      <label htmlFor="font-size-control">Font Size</label>
      <input
        id="font-size-control"
        type="number"
        value={fontSize}
        onChange={handleFontSizeChange}
        aria-label="Font Size"
        min={8} // Optional minimum font size limit
        max={36}
        step="1"
        style={{
          width: "60px",
          marginLeft: "10px",
        }}
      />
    </div>
  );
};

export default FontSizeControls;
