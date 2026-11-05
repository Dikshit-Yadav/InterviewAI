import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
// test check
type Props = {
  value: string;
  onChange: (val: string) => void;
  language?: string;
  readOnly?: boolean;
};

export default function CodeEditor({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
}: Props) {
  const isJsLike = ["javascript", "typescript", "jsx", "tsx", "js", "ts"].includes(
    (language || "").toLowerCase()
  );
  const extensions = isJsLike ? [javascript({ jsx: true })] : [];

  const handlePrevent = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onPaste={handlePrevent}
      onCopy={handlePrevent}
      onCut={handlePrevent}
      onDrop={handlePrevent}
      className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-[#282c34] font-mono text-sm shadow-inner select-none"
    >
      <CodeMirror
        value={value}
        height="100%"
        theme={oneDark}
        readOnly={readOnly}
        editable={!readOnly}
        autoFocus={!readOnly}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        onChange={(val: string) => onChange(val)}
        className="h-full overflow-auto text-sm"
      />
    </div>
  );
}
