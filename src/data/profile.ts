// Personal info shown across the site. This is the only place to edit it.
export const profile = {
  name: "TODO Full Name",
  handle: "se7enbit",
  title: "Electrical & Computer Engineer",
  university: "TODO University",
  graduation: "TODO year",
  location: "TODO City, Country",
  bio: "TODO 2–3 sentence bio.",
  email: "TODO@example.com",
  linkedin: "https://www.linkedin.com/in/TODO",
  github: ["https://github.com/Se7enBit", "https://github.com/ntua-el20014"],
  cv: "/cv.pdf",              // put the PDF in public/cv.pdf
  skills: {
    languages: ["TODO"],
    systems:   ["TODO"],
    tools:     ["TODO"],
  },
  neofetch: {                 // free-form key → value rows shown in neofetch
    OS: "ECE Graduate @ TODO",
    Kernel: "TODO",
    Shell: "TODO",
    DE: "TODO",
  },
};

export type Profile = typeof profile;
