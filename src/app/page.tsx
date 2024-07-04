"use client";
import "regenerator-runtime/runtime";

import React, { useState, useRef, useEffect } from "react";
import {
  IconBriefcase,
  IconBulb,
  IconChevronDown,
  IconCopy,
  IconHeart,
  IconLanguage,
  IconLink,
  IconMicrophone,
  IconMoodSmile,
  IconPaperclip,
  IconSchool,
  IconStar,
  IconThumbDown,
  IconThumbUp,
  IconVolume,
  IconWriting,
} from "@tabler/icons-react";
import { OpenAI } from "openai";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

function rtfToText(rtf: any) {
  const rtfRegex = /\\([a-z]+)(-?\d+)? ?|[{}]|\\'([0-9a-fA-F]{2})|([^\\{}]+)/g;
  let match;
  let output = [];
  let stack = [] as any;

  while ((match = rtfRegex.exec(rtf)) !== null) {
    if (match[0] === "{") {
      stack.push(output.length);
    } else if (match[0] === "}") {
      output.splice(stack.pop(), 0);
    } else if (match[0][0] === "\\") {
      if (match[1] === "par" || match[1] === "line") {
        output.push("\n");
      } else if (match[1] === "tab") {
        output.push("\t");
      } else if (match[1] === "uc") {
        // Unicode character count to skip
        rtfRegex.lastIndex += Number(match[2]);
      } else if (match[1] === "'") {
        output.push(String.fromCharCode(parseInt(match[3], 16)));
      }
    } else {
      output.push(match[0]);
    }
  }
  return output.join("");
}

const Home: React.FC = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const [sourceText, setSourceText] = useState<string>("");
  const [targetText, setTargetText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [languages] = useState<string[]>([
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Spanish");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");
        setSourceText(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
      };

      return () => {
        recognitionRef.current?.stop();
      };
    }
  }, []);

  const handleVoiceRecording = () => {
    if (isRecording) {
      // recognitionRef.current?.stop();
      SpeechRecognition.startListening();
    } else {
      // recognitionRef.current?.start();
      SpeechRecognition.stopListening();
    }
    setIsRecording(!isRecording);
    console.log(transcript);
  };

  const handleAudioPlayback = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const rtfContent = reader.result as string;
        const text = rtfToText(rtfContent);
        setSourceText(text);
        handleTranslate(text);
      };
      reader.readAsText(file);
    }
  };

  const handleLinkPaste = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    try {
      const response = await fetch(link);
      const data = await response.text();
      setSourceText(data);
    } catch (error) {
      console.error("Error fetching link content:", error);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTranslate = async (sourceText: any) => {
    try {
      const response = (await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `You will be provided with a sentence. This sentense ${sourceText} Your tasks are to:
        - Detect what language the sentence is in
        - Translate the sentence into ${selectedLanguage}
        Do not return anything other than the translated sentence.`,
          },
        ],
      })) as any;

      const data = response.choices[0].message.content;
      setTargetText(data);
    } catch (error) {
      console.error("Error translating text:", error);
    }
  };

  useEffect(() => {
    if (sourceText.trim()) {
      const timeoutId = setTimeout(() => {
        handleTranslate(sourceText);
      }, 500); // Adjust the delay as needed

      return () => clearTimeout(timeoutId);
    }
  }, [sourceText, selectedLanguage]);

  const handleLike = () => {
    // Implement like logic
  };

  const handleDislike = () => {
    // Implement dislike logic
  };

  const handleFavorite = () => {
    setFavorite(!favorite);
    if (!favorite) {
      localStorage.setItem("favoriteTranslation", targetText);
    } else {
      localStorage.removeItem("favoriteTranslation");
    }
  };

  return (
    <div className="w-full dark:bg-black bg-white dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="relative overflow-hidden h-screen">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-800 dark:text-neutral-200">
              Lingua<span className="text-[#f87315]">Speak</span>
            </h1>

            <p className="mt-3 text-gray-600 dark:text-neutral-400">
              LinguaSpeak: Bridging Voices, Connecting Worlds.
            </p>

            <div className="mt-7 sm:mt-12 mx-auto max-w-3xl relative">
              <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
                <div className="relative z-10 flex flex-col space-x-3 p-3 bg-white border rounded-lg shadow-lg shadow-gray-100 dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-gray-900/20">
                  <div className="flex-[1_0_0%]">
                    <label className="block text-sm text-gray-700 font-medium dark:text-white">
                      <span className="sr-only">Source Language</span>
                    </label>
                    <textarea
                      rows={5}
                      name="source-language"
                      id="source-language"
                      className="py-2.5 px-4 border-none focus:outline-none block w-full border-transparent rounded-lg dark:bg-neutral-900 dark:border-transparent dark:text-neutral-400"
                      placeholder="Source Language"
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex flex-row justify-between w-full">
                      <span className="cursor-pointer flex space-x-2 flex-row">
                        <IconMicrophone
                          size={22}
                          className="text-gray-400"
                          onClick={handleVoiceRecording}
                        />
                        <IconVolume
                          size={22}
                          onClick={() => handleAudioPlayback(sourceText)}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <IconPaperclip size={21} />
                        </label>
                        <input
                          type="file"
                          id="file-upload"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="link-input"
                          className="cursor-pointer"
                        ></label>
                        <input
                          type="text"
                          id="link-input"
                          className="hidden"
                          onChange={handleLinkPaste}
                        />
                      </span>
                      <span className="text-sm">
                        {sourceText.length} / 2000
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col space-x-3 p-3 bg-white border rounded-lg shadow-lg shadow-gray-100 dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-gray-900/20">
                  <div className="flex-[1_0_0%]">
                    <label className="block text-sm text-gray-700 font-medium dark:text-white">
                      <span className="sr-only">Target Language</span>
                    </label>
                    <textarea
                      rows={5}
                      name="target-language"
                      id="target-language"
                      className="py-2.5 px-4 block w-full border-transparent rounded-lg focus:outline-none dark:bg-neutral-900 dark:border-transparent dark:text-neutral-400"
                      placeholder="Target Language"
                      value={targetText}
                      onChange={(e) => setTargetText(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex flex-row justify-between w-full">
                      <span className="cursor-pointer flex items-center space-x-2 flex-row">
                        <span className="cursor-pointer rounded-full space-x-1 pl-2 bg-[#000000] flex items-center flex-row">
                          <IconLanguage size={20} />
                          <select
                            value={selectedLanguage}
                            onChange={(e) =>
                              setSelectedLanguage(e.target.value)
                            }
                            className="bg-[#000000]  flex flex-row rounded-full py-1 text-white"
                          >
                            {languages.map((language) => (
                              <option key={language} value={language}>
                                {language}
                              </option>
                            ))}
                          </select>
                        </span>
                        <IconVolume
                          size={22}
                          onClick={() => handleAudioPlayback(targetText)}
                        />
                      </span>
                      <div className="flex flex-row items-center space-x-2 cursor-pointer">
                        <IconCopy size={22} onClick={handleCopyToClipboard} />
                        {copied && (
                          <span className="text-xs text-green-500">
                            Copied!
                          </span>
                        )}
                        <IconThumbUp size={22} onClick={handleLike} />
                        <IconThumbDown size={22} onClick={handleDislike} />
                        <IconStar
                          size={22}
                          onClick={handleFavorite}
                          className={favorite ? "text-yellow-500" : ""}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden z-[200] md:block absolute top-0 end-0 -translate-y-12 translate-x-20"></div>
              <div className="hidden md:block absolute bottom-0 start-0 translate-y-10 -translate-x-32"></div>
            </div>

            <div className="mt-10 sm:mt-20">
              <a
                className="m-1 py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                href="#"
              >
                <IconBriefcase size={20} />
                Global BizTalk
              </a>
              <a
                className="m-1 py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                href="#"
              >
                <IconSchool size={20} />
                Plan & Speak
              </a>
              <a
                className="m-1 py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                href="#"
              >
                <IconHeart size={20} />
                MedChat
              </a>
              <a
                className="m-1 py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                href="#"
              >
                <IconBulb size={20} />
                Creative Connect
              </a>
              <a
                className="m-1 py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                href="#"
              >
                <IconWriting size={20} />
                EcoVoice
              </a>
              <a
                className="m-1 py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                href="#"
              >
                <IconMoodSmile size={20} />
                Travel Talk
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
