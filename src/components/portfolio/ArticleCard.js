import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const ArticleCard = ({ article, index }) => {
  const handleClick = () => {
    if (article.url) {
      window.open(article.url, "_blank", "noopener,noreferrer");
    }
  };
  return (
    <Link
      href={article.url ? "#" : `/articles/${article.slug}`}
      onClick={handleClick}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="border border-grey-border rounded-lg p-8 mb-6 hover:border-grey-text transition-all duration-300 bg-white cursor-pointer"
      >
        <h3 className="text-2xl font-semibold mb-3">{article.title}</h3>
        <p className="text-grey-text mb-4 leading-relaxed">
          {article.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-grey-whitesmoke border border-grey-border rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-grey-text2 text-sm">
          {new Date(article.publishedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>
    </Link>
  );
};

export default ArticleCard;
