import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

const SocialProofModal = ({ isOpen, onClose }) => {
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/codziller",
      icon: FaGithub,
      label: "github.com/codziller",
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/yusuf-akinpeju-1b06a31a5",
      icon: FaLinkedin,
      label: "linkedin.com/in/yusuf-akinpeju",
    },
    {
      name: "X",
      url: "https://x.com/yoosoofthefool",
      icon: FaXTwitter,
      label: "x.com/yoosoofthefool",
    },
    {
      name: "Email",
      url: "mailto:akinpejuyusuf@gmail.com",
      icon: MdEmail,
      label: "akinpejuyusuf@gmail.com",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
          />

          {/* Modal Container - handles centering */}
          <div
            className="fixed inset-0 flex items-center justify-center px-4"
            style={{ zIndex: 9999 }}
          >
            {/* Modal - handles animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Connect with me</h3>
                <button
                  onClick={onClose}
                  className="text-grey-text hover:text-black transition-colors text-2xl leading-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 border border-grey-border rounded-lg hover:border-grey-text hover:bg-grey-whitesmoke3 transition-all duration-200 group"
                    >
                      <Icon size={28} className="text-black flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-black group-hover:text-blue-500 transition-colors">
                          {social.name}
                        </div>
                        <div className="text-sm text-grey-text truncate">
                          {social.label}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SocialProofModal;
