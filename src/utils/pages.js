const pages = [
  {
    url: "/",
    title: "Yusuf",
    description: "Fullstack engineer",
    thumbnail: "",
  },
];
export const getPageByPath = (path) =>
  pages.find(({ url }) => url === path) || pages[0];
