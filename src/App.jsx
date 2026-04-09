import React, { useState } from 'react'
import { AppProvider } from './contexts/AppContext'
import AppContent from './components/layout/AppContent'
import { DATA_SOURCE_TYPES } from './services/dataService'

function App() {
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  
  return (
    <AppProvider dataSource={selectedDataSource || DATA_SOURCE_TYPES.LOCAL}>
      <AppContent onSelectedDataSourceChange={setSelectedDataSource} />
    </AppProvider>
  )
}

export default App
