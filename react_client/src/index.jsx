import React from "react";
import App from "./components/App";
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// If you're running this locally in VS Code use the commands:
// npm create vite@latest my-react-app --template react 
// to install vite (select React then Javascript)
// npm install
// to install the node modules and
// npm run dev
// to launch your react project in your browser