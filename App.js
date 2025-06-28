'use client';

import { useState } from 'react';
import { WagmiConfig, createConfig, configureChains, mainnet, useAccount } from 'wagmi';
import { http } from 'viem';
import { RainbowKitProvider, getDefaultWallets, ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBbXNxH89NqAy8bbbQdLFy-jmO0q_SxC5A",
  authDomain: "promptpool-token.firebaseapp.com",
  projectId: "promptpool-token",
  storageBucket: "promptpool-token.appspot.com",
  messagingSenderId: "1036022646309",
  appId: "1:1036022646309:web:d96d681ee12b568d0321cc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const { chains, publicClient } = configureChains([mainnet], [http()]);
const { connectors } = getDefaultWallets({
  appName: 'PromptPool',
  projectId: 'promptpool-dapp',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const { address } = useAccount();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert('You must accept the contributor terms.');
      return;
    }
    if (!prompt.trim()) {
      alert('Prompt cannot be empty.');
      return;
    }

    const generatedId = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'prompt-' + Date.now();

    try {
      await addDoc(collection(db, 'prompts'), {
        prompt: prompt.trim(),
        acceptedTerms: true,
        createdAt: serverTimestamp(),
        wallet: address || 'anonymous',
        id: generatedId,
        category: category.trim(),
        ip: '',
        flagged: false,
      });
      setSubmissionSuccess(true);
      setPrompt('');
      setCategory('');
      setAcceptedTerms(false);
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('There was an error saving your prompt. Please try again.');
    }
  };

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-xl">
            <h1 className="text-4xl font-bold mb-6 text-center">PromptPool</h1>
            <ConnectButton />
            <form onSubmit={handleSubmit} className="mt-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="w-full p-4 border border-gray-300 rounded-md mb-4"
                rows={5}
                required
              />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (e.g. Creative Writing, Marketing, etc.)"
                className="w-full p-4 border border-gray-300 rounded-md mb-4"
              />
              <label className="block mb-4">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mr-2"
                />
                I accept the contributor terms (non-exclusive, royalty-free license).
              </label>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
              >
                Submit Prompt
              </button>
              {submissionSuccess && (
                <p className="text-green-600 mt-4">Prompt submitted successfully!</p>
              )}
            </form>
          </div>
        </main>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}