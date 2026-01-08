# Sentence Dictation Practice Tool

## Project Overview

The Sentence Dictation Practice Tool is an interactive web application designed to help users improve their listening and spelling skills through sentence dictation exercises. The application features multiple data sources, speech synthesis, phonetic display, and word-by-word input for an enhanced learning experience.

### Key Features

- **Multiple Data Sources**: Choose from local JSON files, Notion pages, or New Concept English textbooks
- **Speech Synthesis**: Listen to sentences with adjustable speed
- **Phonetic Display**: View phonetic transcriptions of words
- **Word-by-Word Input**: Practice spelling one word at a time
- **Real-time Feedback**: Instant validation of correct answers
- **Progress Tracking**: Keep track of your position through exercises
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
sentences-dictation/
├── .cache/                  # Cached API responses
├── doc/                     # Documentation files
│   └── 功能列表.md           # Feature list (Chinese)
├── netlify/                 # Netlify Functions
│   └── functions/           # Serverless functions
│       ├── get-new-concept-3-lesson.js   # Get New Concept 3 lesson content
│       ├── get-new-concept-3.js          # Get New Concept 3 articles list
│       ├── get-notion-sentences.js       # Get sentences from Notion
│       └── get-real-article-link.js      # Get real article links
├── public/                  # Public assets
├── src/                     # Source code
│   ├── assets/              # Static assets
│   ├── data/                # Local data files
│   │   ├── new-concept-1.json  # New Concept English 1 sentences
│   │   └── sentences.json       # Local practice sentences
│   ├── services/            # Service modules
│   │   ├── cacheService.js      # Cache management
│   │   ├── dataService.js       # Data source management
│   │   ├── pronunciationService.js  # Phonetic transcription
│   │   └── speechService.js     # Text-to-speech functionality
│   ├── App.css              # Main application styles
│   ├── App.jsx              # Main application component
│   ├── index.css            # Global styles
│   └── main.jsx             # Application entry point
├── .gitignore               # Git ignore file
├── README.md                # Project documentation
├── deno.lock                # Deno dependencies lock file
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── netlify.toml             # Netlify configuration
├── package-lock.json        # npm dependencies lock file
├── package.json             # Project configuration and dependencies
├── requirement.md           # Project requirements
└── vite.config.js           # Vite configuration
```

## Installation Instructions

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Netlify CLI (for local development with serverless functions)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/sentences-dictation.git
   cd sentences-dictation
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install Netlify CLI** (if not already installed)

   ```bash
   npm install -g netlify-cli
   ```

4. **Start the development server**

   ```bash
   npm run netlify-dev
   ```

   This will start both the Vite development server and the Netlify Functions development environment.

5. **Access the application**

   Open your browser and navigate to `http://localhost:8888`

## Configuration Steps

### Environment Variables

The application requires the following environment variables for Netlify Functions:

1. **For Notion integration**:
   - `NOTION_API_KEY`: Your Notion API key
   - `NOTION_PAGE_ID`: The ID of the Notion page containing sentences

2. **For New Concept English 3 integration**:
   - No additional environment variables required (uses web scraping)

3. **Local development**:
   Create a `.env` file in the project root with the required variables:

   ```env
   NOTION_API_KEY=your_notion_api_key
   NOTION_PAGE_ID=your_notion_page_id
   ```

### Netlify Functions Configuration

The `netlify.toml` file configures the serverless functions for deployment:

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[dev]
  publish = "dist"
  functions = "netlify/functions"
  port = 8888
```

## Usage Examples

### Basic Usage Flow

1. **Select a data source** from the initial selection page
2. **If using New Concept 3**, select a specific article
3. **Listen to the sentence** using the play button
4. **Adjust speech speed** if needed
5. **Type the words** in the corresponding input fields
6. **Receive instant feedback** on correct/incorrect answers
7. **Move to the next sentence** automatically or manually

### Data Source Selection

The application supports four data sources:

1. **Local Data**: Uses sentences from the local `sentences.json` file
2. **Notion**: Pulls sentences from a configured Notion page
3. **New Concept 1**: Uses sentences from the New Concept English 1 textbook
4. **New Concept 3**: Fetches articles from the New Concept English 3 textbook

### Speech Synthesis Features

- **Play/Pause**: Control audio playback
- **Speed Adjustment**: Choose from 0.5x to 2.0x speed
- **Auto-Play**: Automatically play sentences when loaded
- **Browser Compatibility**: Works in most modern browsers with Web Speech API support

## API Documentation

### Netlify Functions

The application uses Netlify Functions for server-side operations:

#### 1. get-notion-sentences

**Purpose**: Fetches sentences from a Notion page

**Endpoint**: `/.netlify/functions/get-notion-sentences`

**Method**: GET

**Response Format**:
```json
{
  "success": true,
  "sentences": ["Sentence 1", "Sentence 2", ...]
}
```

#### 2. get-new-concept-3

**Purpose**: Fetches the list of New Concept English 3 articles

**Endpoint**: `/.netlify/functions/get-new-concept-3`

**Method**: GET

**Response Format**:
```json
{
  "success": true,
  "articles": [
    {
      "id": 1,
      "title": "Article Title",
      "link": "https://..."
    },
    ...
  ]
}
```

#### 3. get-new-concept-3-lesson

**Purpose**: Fetches content for a specific New Concept English 3 lesson

**Endpoint**: `/.netlify/functions/get-new-concept-3-lesson`

**Method**: POST

**Request Body**:
```json
{
  "link": "https://..."
}
```

**Response Format**:
```json
{
  "success": true,
  "sentences": ["Sentence 1", "Sentence 2", ...]
}
```

#### 4. get-real-article-link

**Purpose**: Gets the real link for an article

**Endpoint**: `/.netlify/functions/get-real-article-link`

**Method**: GET

**Response Format**:
```json
{
  "success": true,
  "link": "https://..."
}
```

## Contribution Guidelines

### Project Structure

When contributing to this project, follow the existing file structure and naming conventions:

- React components in `src/` directory
- Service modules in `src/services/`
- Data files in `src/data/`
- Serverless functions in `netlify/functions/`

### Code Style

- Use ES6+ syntax
- Follow ESLint rules (see `eslint.config.js`)
- Use `camelCase` for variables and functions
- Use `PascalCase` for React components
- Add JSDoc comments for functions and modules

### Adding New Data Sources

To add a new data source:

1. Add a new constant to `DATA_SOURCE_TYPES` in `dataService.js`
2. Add a new entry to `DATA_SOURCES` array with name, description, and icon
3. Implement a data fetching function for the new source
4. Add a case to the switch statement in `getSentencesBySource`
5. Update the UI to handle any specific requirements for the new source

### Testing

- Test changes locally using `npm run netlify-dev`
- Verify all data sources work correctly
- Test speech synthesis in different browsers
- Ensure responsive design works on various screen sizes

## Troubleshooting

### Common Issues and Solutions

1. **Speech synthesis not working**
   - **Solution**: Check browser compatibility (requires Web Speech API support)
   - **Alternative**: Use a browser that supports speech synthesis (Chrome, Edge, Safari)

2. **Netlify Functions errors**
   - **Solution**: Ensure Netlify CLI is installed and running with `npm run netlify-dev`
   - **Check**: Verify environment variables are set correctly

3. **Notion integration failing**
   - **Solution**: Check that the Notion API key has proper permissions
   - **Verify**: Ensure the Notion page ID is correct and accessible

4. **New Concept 3 articles not loading**
   - **Solution**: Check network connection and web scraping permissions
   - **Alternative**: Use a different data source if web scraping is blocked

5. **Local development issues**
   - **Solution**: Clear browser cache and restart development server
   - **Check**: Ensure all dependencies are installed correctly

### Error Messages

| Error Message | Possible Cause | Solution |
|---------------|---------------|----------|
| "Netlify Functions 未运行或返回了非 JSON 数据" | Netlify CLI not running | Start with `npm run netlify-dev` |
| "请求超时，请检查网络连接" | Network issues or slow API response | Check internet connection, try again |
| "数据源返回空数据" | Empty data source or API error | Try a different data source |
| "Speech synthesis is not supported" | Browser compatibility issue | Use a supported browser |

## Technical Accuracy

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI library |
| react-dom | ^19.2.0 | React DOM manipulation |
| @notionhq/client | ^2.2.15 | Notion API integration |
| axios | ^1.7.7 | HTTP client |
| cheerio | ^1.0.0 | HTML parsing (web scraping) |
| cmu-pronouncing-dictionary | ^3.0.0 | Phonetic transcription |
| netlify-cli | ^23.13.1 | Local development with Netlify |
| vite | ^7.2.4 | Build tool |

### Browser Compatibility

- **Supported**: Chrome 33+, Edge 79+, Safari 7+, Firefox 49+
- **Limited Support**: Older browsers may not support speech synthesis
- **Recommended**: Use the latest version of Chrome or Edge for best experience

### Performance Optimization

- **Caching**: API responses are cached in the `.cache/` directory
- **Lazy Loading**: Components load only when needed
- **Minification**: Production builds are minified for faster loading
- **Code Splitting**: Resources are split for optimal loading

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [New Concept English](https://www.newconceptenglish.com/) for educational content
- [Notion API](https://developers.notion.com/) for integration capabilities
- [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict) for phonetic transcriptions
- [Netlify](https://www.netlify.com/) for serverless functions hosting

---

**Happy Learning!** 🎓