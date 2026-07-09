import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "edutechsrm",
    short_name: "edutechsrm",
    description: "Free SRMIST KTR student dashboard for timetable, attendance, marks, assignments, GradeX and academic calendar.",
    start_url: "/?v=2",
    display: "standalone",
    background_color: "#071423",
    theme_color: "#071423",
    icons: [
      {
        src: "/icon-192-v2.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512-v2.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon-v2.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}
