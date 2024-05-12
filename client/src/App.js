import React, { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import "./App.css";

function App() {
  // State variables to manage input, result, and loading state
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to handle form submission
  const handleSubmit = async () => {
    try {
      // Format URL to handle variations
      const formattedUrl = url.startsWith("https://en.wikipedia.org")
        ? url.slice(24)
        : url;

      // Set loading state and clear previous result
      setLoading(true);
      setResult(null);

      // Fetch data from the backend API
      const response = await fetch("/api/wikipedia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formattedUrl }),
      });

      // Check for errors in the response
      if (!response.ok) {
        // Display error toast and return
        const errorData = await response.json();
        toast.error(errorData.error);
        return;
      }

      // Parse and set the result data
      const data = await response.json();
      setResult(data);
    } catch (error) {
      // Log and handle errors
      console.error(error);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  // Function to handle clearing the input box and result
  const handleClear = () => {
    setUrl("");
    setResult(null);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
        Wikipedia Loop
      </h1>

      {/* Input Form */}
      <label
        style={{
          display: "block",
          marginBottom: "1rem",
          fontWeight: "bold",
          fontSize: "1.25rem",
        }}
      >
        Enter Wikipedia URL:
        <input
          type="text"
          value={url}
          required
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "30rem",
            margin: "0 auto",
            display: "block",
            marginTop: "1rem",
            padding: "0.5rem",
            fontSize: "1rem",
            borderRadius: "5px",
            border: "1px solid #ddd",
          }}
        />
      </label>

      {/* Submit Button */}
      <button
        disabled={!url.trim() || loading}
        onClick={handleSubmit}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "0.5rem"
        }}
      >
        {result ? "Restart " : "Start "}
      </button>

      {/* Clear Button */}
      <button
        onClick={handleClear}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Clear
      </button>

      {/* Loading Spinner */}
      {loading && (
        <div
          style={{
            border: "6px solid #f3f3f3",
            borderTop: "6px solid #3498db",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            margin: "1rem auto",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      )}

      {/* Display Result or Infinite Loop Message */}
      {result && (
        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "1rem",
            borderRadius: "5px",
            margin: "2rem auto",
            maxWidth: "600px",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            {result.infiniteLoop
              ? "Infinite Loop Detected!"
              : "Result"}
          </h2>
          {result.infiniteLoop ? (
            <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              This page will never lead to Philosophy.
            </p>
          ) : (
            <>
              <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                {/* Number of requests or page visits to reach Philosophy Page */}
                Number of requests:{" "}
                <span
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#3498db",
                  }}
                >
                  {result.steps}
                </span>
                <br />
                {/* Execution time */}
                Execution time:{" "}
                <span
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#3498db",
                  }}
                >
                  {(result.timeTaken / 1000).toFixed(2)} seconds
                </span>
              </p>

              {/* List of Visited Pages */}
              {result.visitedPages && result.visitedPages.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    padding: "0",
                    margin: "0",
                    textAlign: "left",
                  }}
                >
                  {result.visitedPages.map((page, index) => (
                    <li
                      key={index}
                      onClick={() =>
                        window.open(
                          `https://en.wikipedia.org${page}`,
                          "_blank"
                        )
                      }
                      style={{
                        padding: "0.5rem",
                        borderBottom: "1px solid #ddd",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) =>
                        e.target.style.backgroundColor = "#f0f0f0"
                      }
                      onMouseLeave={(e) =>
                        e.target.style.backgroundColor = "transparent"
                      }
                    >
                      {page}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {/* Toast Container for Notifications */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{ zIndex: '9999999999' }} // Ensure the container has a high z-index
        toastOptions={{
          className: '',
          duration: 5000,
          style: {
            background: 'white',
            color: 'black',
            fontSize: '16px',
          },
          success: {
            duration: 3000,
           
          },
        }}
      />

<div style={{ position: "fixed", bottom: "10px", width: "100%", textAlign: "center", color: "#777" }}>
        Made by <a href="https://github.com/mayankyadav1711" target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>Mayank Yadav</a>
      </div>
    </div>
  );
}

export default App;
