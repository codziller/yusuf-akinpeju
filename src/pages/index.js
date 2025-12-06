import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { AnimatePresence, motion } from "framer-motion";
import Header from "components/portfolio/Header";
import ExperienceCard from "components/portfolio/ExperienceCard";
import ArticleCard from "components/portfolio/ArticleCard";
import MouseTrail from "components/portfolio/MouseTrail";
import SocialProofModal from "components/portfolio/SocialProofModal";
import SectionToggle from "components/portfolio/SectionToggle";
import { allExperiences } from "data/experiences";
import { articles } from "data/articles";

export default function Portfolio() {
  const router = useRouter();
  const [jazzEnabled, setJazzEnabled] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [currentSection, setCurrentSection] = useState("experience");

  useEffect(() => {
    if (router.query.section === "thoughts") {
      setCurrentSection("thoughts");
    }
  }, [router.query.section]);

  const handleToggleSection = () => {
    const newSection =
      currentSection === "experience" ? "thoughts" : "experience";
    setCurrentSection(newSection);

    // Update URL query parameter
    if (newSection === "thoughts") {
      router.push("/?section=thoughts", undefined, { shallow: true });
    } else {
      router.push("/", undefined, { shallow: true });
    }
  };

  const sectionVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const direction = currentSection === "thoughts" ? 1 : -1;

  return (
    <>
      <Head>
        <title>Yusuf Akinpeju - Fullstack Engineer</title>
        <meta
          name="description"
          content="Software Engineer with over 8 years of experience building scalable, performant, and secure web and mobile platforms."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Yusuf Akinpeju - Fullstack Engineer"
        />
        <meta
          property="og:description"
          content="Software Engineer with over 8 years of experience building scalable, performant, and secure web and mobile platforms."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Yusuf Akinpeju - Fullstack Engineer"
        />
        <meta
          name="twitter:description"
          content="Software Engineer with over 8 years of experience building scalable, performant, and secure web and mobile platforms."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MouseTrail enabled={jazzEnabled} />
      <SocialProofModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />
      <SectionToggle
        currentSection={currentSection}
        onToggle={handleToggleSection}
      />

      <div className="min-h-screen bg-white">
        <Header
          jazzEnabled={jazzEnabled}
          setJazzEnabled={setJazzEnabled}
          onSocialProofClick={() => setShowSocialModal(true)}
        />

        {/* Add padding to account for fixed header */}
        <div className="pt-20 md:pt-20">
          <main className="max-w-5xl mx-auto px-4 md:px-8 py-12 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {currentSection === "experience" ? (
                <motion.section
                  key="experience"
                  custom={direction}
                  variants={sectionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                >
                  <h2 className="text-3xl font-bold mb-8">experience</h2>
                  <div className="space-y-6">
                    {allExperiences.map((experience, index) => (
                      <ExperienceCard
                        key={experience.id}
                        experience={experience}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.section>
              ) : (
                <motion.section
                  key="thoughts"
                  custom={direction}
                  variants={sectionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                >
                  <h2 className="text-3xl font-bold mb-8">thought corner</h2>
                  <div className="space-y-6">
                    {articles.map((article, index) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  );
}
