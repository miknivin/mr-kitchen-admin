// ReusableAlert.tsx
import React from "react";

interface ReusableAlertProps {
  content: string;
  title: string;
  func?: () => void;
  isOpen: boolean;
  onClose: () => void;
  functionTitle: string;
  buttonStyle: string;
}

export default function ReusableAlert({
  content,
  title,
  func,
  isOpen,
  functionTitle,
  onClose,
  buttonStyle = "bg-red-600",
}: ReusableAlertProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <dialog
        id="my_modal_1"
        className="!dark:bg-gray-900/70 modal !bg-gray-100/70"
        style={{ background: "rgba(0,0,0,0.7)" }}
        open={isOpen}
      >
        <div className="modal-box rounded-lg bg-black p-7 dark:bg-gray-50">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="py-4">{content}</p>
          <div className="modal-action">
            <form method="dialog" className="flex w-full justify-end gap-4">
              <button
                className={`${buttonStyle} btn text-white`}
                onClick={() => {
                  if (func) func();
                  handleClose();
                }}
              >
                {functionTitle}
              </button>
              <button className="btn" onClick={handleClose}>
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
