import re

with open('src/pages/AssistantPage.tsx', 'r') as f:
    content = f.read()

# 1. Add imports
if 'useRef' not in content:
    content = content.replace("import { useState, useEffect }", "import { useState, useEffect, useRef }")
else:
    content = content.replace("import { useState, useEffect, useRef }", "import { useState, useEffect, useRef }")

if 'X' not in content:
    content = content.replace("import { Bot, User,", "import { Bot, User, X,")

# 2. Add state variables inside AssistantPage
state_additions = """
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Microphone State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
          setIsRecording(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
          alert('Microphone permission denied or error occurred: ' + event.error);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('Microphone/Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

"""
content = re.sub(r'(const textareaRef = useRef<HTMLTextAreaElement>\(null\);)', r'\1\n' + state_additions, content)

# 3. Modify handleSend to handle files
send_modification = """  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    let messageContent = input.trim();
    if (selectedFile) {
      if (selectedFile.type === 'text/plain') {
        const fileText = await selectedFile.text();
        messageContent = `[Attached File: ${selectedFile.name}]\\n${fileText}\\n\\nUser message: ${messageContent}`;
      } else {
        messageContent = `[Attached File: ${selectedFile.name} - Note: AI file parsing for this format is not yet supported in this version]\\n\\n${messageContent}`;
      }
    }

    const newUserMsg: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };
"""
content = re.sub(r'  const handleSend = async \(\) => \{\n    if \(\!input\.trim\(\)\) return;\n\n    const newUserMsg: AssistantMessage = \{\n      id: Date\.now\(\)\.toString\(\),\n      role: \'user\',\n      content: input\.trim\(\),\n      timestamp: new Date\(\)\.toISOString\(\),\n    \};', send_modification, content)

clear_file_after_send = """    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setSelectedFile(null);
    setIsSending(true);"""
content = re.sub(r'    setMessages\(\(prev\) => \[\.\.\.prev, newUserMsg\]\);\n    setInput\(\'\'\);\n    setIsSending\(true\);', clear_file_after_send, content)


# 4. Modify the UI buttons
ui_buttons = """          {/* Selected File UI */}
          {selectedFile && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-muted/50 rounded-md border border-border text-sm w-fit">
              <Paperclip className="h-4 w-4 text-primary" />
              <span className="truncate max-w-[200px]">{selectedFile.name}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => setSelectedFile(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.doc,.docx,.txt"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 shrink-0 hover:text-primary hover:bg-primary/10" 
              aria-label="Attach file" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a product, standard, certification, testing or BIS service…"
              className="min-h-[40px] max-h-32 resize-none border-0 focus-visible:ring-0 text-sm"
              rows={1}
              aria-label="Chat input"
            />
            <Button 
              variant={isRecording ? "destructive" : "ghost"} 
              size="icon" 
              className={isRecording ? "h-9 w-9 shrink-0 animate-pulse" : "h-9 w-9 shrink-0 hover:text-primary hover:bg-primary/10"} 
              aria-label="Voice input" 
              onClick={handleMicClick}
            >
              <Mic className="h-4 w-4" />
            </Button>"""

content = re.sub(r'          <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring">\n            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Attach file" disabled>\n              <Paperclip className="h-4 w-4" />\n            </Button>\n            <Textarea\n              ref=\{textareaRef\}\n              value=\{input\}\n              onChange=\{\(e\) => setInput\(e\.target\.value\)\}\n              onKeyDown=\{handleKeyDown\}\n              placeholder="Ask about a product, standard, certification, testing or BIS service…"\n              className="min-h-\[40px\] max-h-32 resize-none border-0 focus-visible:ring-0 text-sm"\n              rows=\{1\}\n              aria-label="Chat input"\n            />\n            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Voice input \(placeholder\)" disabled>\n              <Mic className="h-4 w-4" />\n            </Button>', ui_buttons, content)

send_button = """            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => handleSend()}
              disabled={(!input.trim() && !selectedFile) || isSending}
              aria-label="Send message"
            >"""
content = re.sub(r'            <Button\n              size="icon"\n              className="h-9 w-9 shrink-0"\n              onClick=\{\(\) => handleSend\(\)\}\n              disabled=\{\!input\.trim\(\) \|\| isSending\}\n              aria-label="Send message"\n            >', send_button, content)

with open('src/pages/AssistantPage.tsx', 'w') as f:
    f.write(content)
