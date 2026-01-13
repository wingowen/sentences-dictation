// Markdown Parser Service - Parses flashcard data from Markdown files

/**
 * Parses Markdown content and extracts flashcard data
 * @param {string} content - Markdown file content
 * @returns {Object} Parsed flashcard data
 */
export const parseMarkdownFlashcards = (content) => {
  try {
    // Parse YAML front matter
    const frontMatterMatch = content.match(/^---[\s\S]*?---/);
    let tags = [];
    
    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[0];
      const tagsMatch = frontMatter.match(/tags:\s*\[(.*?)\]/s);
      if (tagsMatch) {
        tags = tagsMatch[1]
          .split(',')
          .map(tag => tag.trim().replace(/['"]/g, ''))
          .filter(tag => tag !== '');
      }
      // Remove front matter from content
      content = content.replace(frontMatter, '').trim();
    }
    
    // Extract sections (categories) based on ## headings
    const sections = content.split(/^##\s+/m);
    const flashcards = [];
    
    sections.forEach((section, index) => {
      if (index === 0 && !section) return; // Skip empty first section
      
      const lines = section.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) return;
      
      // Section heading is the first line
      const category = lines[0].trim();
      
      // Process remaining lines as flashcards
      let i = 1;
      while (i < lines.length) {
        // Skip comment lines
        if (lines[i].trim().startsWith('<!--')) {
          i++;
          continue;
        }
        
        const chineseLine = lines[i];
        const englishLine = lines[i + 1];
        
        if (chineseLine && englishLine) {
          // Extract Chinese content (remove trailing spaces)
          const chineseContent = chineseLine.trim().replace(/\s+$/, '');
          
          // Extract English content and handle placeholders
          let englishContent = englishLine.trim();
          
          // Extract vocabulary placeholders
          const vocabularyMatches = englishContent.match(/\{\{([^}]+)\}\}/g) || [];
          const vocabulary = vocabularyMatches.map(match => match.replace(/\{\{([^}]+)\}\}/, '$1').trim());
          
          flashcards.push({
            question: chineseContent,
            answer: englishContent,
            category,
            tags: [...tags, ...vocabulary],
            difficulty: 3 // Default difficulty
          });
          
          i += 2;
        } else {
          // If no English line, move to next line
          i++;
        }
      }
    });
    
    return {
      flashcards,
      tags,
      totalFlashcards: flashcards.length
    };
  } catch (error) {
    console.error('Error parsing markdown:', error);
    throw new Error(`Failed to parse markdown file: ${error.message}`);
  }
};

/**
 * Reads and parses a Markdown file from the specified path
 * @param {string} filePath - Path to the Markdown file
 * @returns {Promise<Object>} Parsed flashcard data
 */
export const readAndParseMarkdownFile = async (filePath) => {
  try {
    // For local files, we'll use fetch API
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }
    
    const content = await response.text();
    return parseMarkdownFlashcards(content);
  } catch (error) {
    console.error('Error reading markdown file:', error);
    throw new Error(`Failed to read markdown file: ${error.message}`);
  }
};

/**
 * Parses flashcard data from a File object
 * @param {File} file - File object to parse
 * @returns {Promise<Object>} Parsed flashcard data
 */
export const parseFlashcardFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const parsedData = parseMarkdownFlashcards(content);
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file, 'utf-8');
  });
};

export default {
  parseMarkdownFlashcards,
  readAndParseMarkdownFile,
  parseFlashcardFile
};