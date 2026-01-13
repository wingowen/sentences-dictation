import React, { useState, useRef } from 'react';
import * as flashcardImportService from '../services/flashcardImportService';

const FlashcardImporter = ({ onClose, onImportComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle import
  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const result = await flashcardImportService.importFlashcardsFromFileObject(selectedFile);
      setImportResult(result);
      
      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (err) {
      setError(err.message);
      console.error('Import error:', err);
    } finally {
      setIsImporting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedFile(null);
    setImportResult(null);
    setError(null);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render import results
  const renderImportResults = () => {
    if (!importResult) return null;

    if (!importResult.success) {
      return (
        <div className="import-error">
          <h4>Import Failed</h4>
          <p>{importResult.error}</p>
        </div>
      );
    }

    const stats = flashcardImportService.getImportStatistics(importResult);

    return (
      <div className="import-results">
        <h4>Import Results</h4>
        <div className="import-stats">
          <div className="stat-item">
            <span>Source:</span>
            <strong>{importResult.source}</strong>
          </div>
          <div className="stat-item">
            <span>Total Flashcards:</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-item">
            <span>Imported:</span>
            <strong className="success">{stats.imported}</strong>
          </div>
          <div className="stat-item">
            <span>Failed:</span>
            <strong className="error">{stats.failed}</strong>
          </div>
          <div className="stat-item">
            <span>Success Rate:</span>
            <strong>{stats.successRate}%</strong>
          </div>
        </div>

        {importResult.errors.length > 0 && (
          <div className="import-errors">
            <h5>Errors:</h5>
            <ul>
              {importResult.errors.map((err, index) => (
                <li key={index}>
                  <span>Flashcard #{err.index + 1}:</span>
                  <ul>
                    {err.errors.map((errorMsg, errorIndex) => (
                      <li key={errorIndex}>{errorMsg}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flashcard-importer">
      <div className="importer-header">
        <h3>Import Flashcards</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="importer-content">
        <div className="file-selection">
          <h4>Select Markdown File</h4>
          <p>Import flashcards from a structured Markdown file</p>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".md,.markdown"
            style={{ display: 'none' }}
          />
          
          <div className="file-selector">
            <button
              className="select-file-button"
              onClick={triggerFileInput}
              disabled={isImporting}
            >
              Select File
            </button>
            {selectedFile && (
              <div className="selected-file">
                <span>{selectedFile.name}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="import-controls">
            <button
              className="import-button"
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? 'Importing...' : 'Import'}
            </button>
            <button
              className="cancel-button"
              onClick={resetForm}
              disabled={isImporting}
            >
              Reset
            </button>
          </div>
        </div>

        {renderImportResults()}
      </div>

      <div className="importer-footer">
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default FlashcardImporter;