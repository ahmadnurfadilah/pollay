export const AskForConfirmation = ({ text, onClickYes, onClickNo }: { text: string; onClickYes: () => void; onClickNo: () => void }) => {
  return (
    <div>
      {text}
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-gray-800 border border-gray-700 text-xs uppercase tracking-wider hover:bg-gray-900" onClick={onClickYes}>
          Yes
        </button>
        <button className="px-4 py-2 rounded bg-gray-800 border border-gray-700 text-xs uppercase tracking-wider hover:bg-gray-900" onClick={onClickNo}>
          No
        </button>
      </div>
    </div>
  );
};
