export interface FileItem {
    name: string
    type: "file" | "folder"
    content?: string
    language?: string
    children?: FileItem[]
}

// Initial template structure
export const getInitialFileStructure = (templateName: string): FileItem[] => [
    {
        name: "src",
        type: "folder",
        children: [
            {
                name: "components",
                type: "folder",
                children: [
                    {
                        name: "Header.tsx",
                        type: "file",
                        language: "typescript",
                        content: `import React from 'react';

const Header = () => {
  const props = {
    title: "${templateName} Header",
    subtitle: "Welcome to our website",
    buttonText: "Learn More",
    buttonLink: "/about"
  };

  return (
    <header className="bg-blue-600 text-white py-12 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">{props.title}</h1>
        <p className="text-xl mb-6">{props.subtitle}</p>
        <button className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium">
          {props.buttonText}
        </button>
      </div>
    </header>
  );
};

export default Header;`,
                    },
                    {
                        name: "Hero.tsx",
                        type: "file",
                        language: "typescript",
                        content: `import React from 'react';

const Hero = () => {
  const props = {
    title: "Build Amazing Websites",
    subtitle: "Create stunning web experiences with our template system",
    backgroundImage: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5",
    buttonText: "Get Started",
    buttonLink: "/templates"
  };

  return (
    <div className="relative h-96 flex items-center justify-center text-white">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: \`url(\${props.backgroundImage})\`,
          filter: 'brightness(0.7)'
        }}
      />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl font-bold mb-4">{props.title}</h1>
        <p className="text-xl mb-8">{props.subtitle}</p>
        <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-md font-medium">
          {props.buttonText}
        </button>
      </div>
    </div>
  );
};

export default Hero;`,
                    },
                ],
            },
            {
                name: "pages",
                type: "folder",
                children: [
                    {
                        name: "Home.tsx",
                        type: "file",
                        language: "typescript",
                        content: `import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';

const Home = () => {
  return (
    <div>
      <Header />
      <Hero />
      <main className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-6">Welcome to our template</h2>
        <p className="text-lg text-neutral-700">
          This is a starter template. Customize it to create your perfect website.
        </p>
      </main>
    </div>
  );
};

export default Home;`,
                    },
                ],
            },
            {
                name: "App.tsx",
                type: "file",
                language: "typescript",
                content: `import React from 'react';
import Home from './pages/Home';

const App = () => {
  return (
    <div className="app">
      <Home />
    </div>
  );
};

export default App;`,
            },
        ],
    },
]

export const flattenFileStructure = (
    items: FileItem[],
    basePath = "",
): Map<string, { content: string; language: string }> => {
    const result = new Map<string, { content: string; language: string }>()

    items.forEach((item) => {
        const path = basePath ? `${basePath}/${item.name}` : item.name

        if (item.type === "file" && item.content) {
            result.set(path, {
                content: item.content,
                language: item.language || "plaintext",
            })
        }

        if (item.children) {
            const childResults = flattenFileStructure(item.children, path)
            childResults.forEach((value, key) => {
                result.set(key, value)
            })
        }
    })

    return result
}

// Create a new folder in the file structure
export const createFolder = (fileStructure: FileItem[], path: string, folderName: string): FileItem[] => {
    const newStructure = [...fileStructure]
    const pathParts = path.split("/")

    let currentLevel = newStructure
    for (const part of pathParts) {
        const folder = currentLevel.find((item) => item.name === part && item.type === "folder")
        if (folder && folder.children) {
            currentLevel = folder.children
        } else {
            // Path doesn't exist, can't create folder
            return newStructure
        }
    }

    // Check if folder already exists
    if (currentLevel.some((item) => item.name === folderName)) {
        return newStructure
    }

    // Add new folder
    currentLevel.push({
        name: folderName,
        type: "folder",
        children: [],
    })

    return newStructure
}
