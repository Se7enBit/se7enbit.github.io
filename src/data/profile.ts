// Personal info shown across the site. This is the only place to edit it.
// After changing name/title/handle, run `npm run og` to refresh the social preview image.
export const profile = {
  name: "Nick Oikonomou",
  handle: "se7enbit",
  title: "Electrical & Computer Engineer",
  university: "National Technical University of Athens",
  graduation: "2027",
  location: "Athens, Greece",
  bio: "Driven by a passion for technology and problem solving. Always seeking to know more.",
  email: "nickoikonomou07@gmail.com",
  linkedin: "https://www.linkedin.com/in/nick-oikonomou/",
  github: ["https://github.com/Se7enBit", "https://github.com/ntua-el20014"],
  cv: "/cv.pdf",              // put the PDF in public/cv.pdf
  skills: {
    languages: ["C", "Python", "TypeScript"],
    systems:   ["Linux", "Operating Systems", "Web", "Databases"],
    tools:     ["Git", "VS Code", "KVM"],
  },
  neofetch: {                 // free-form key → value rows shown in neofetch
    OS: "ECE Graduate @ National Technical University of Athens",
    Kernel: "systems / virtualization",
    Uptime: "since 2019",
    Shell: "bash",
    DE: "VS Code",
  },
};

export type Profile = typeof profile;
