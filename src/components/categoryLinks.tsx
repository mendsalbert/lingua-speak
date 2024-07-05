import React from "react";
import {
  IconBriefcase,
  IconBulb,
  IconSchool,
  IconWriting,
  IconMoodSmile,
  IconHeart,
} from "@tabler/icons-react";

const categories = [
  { icon: IconBriefcase, label: "Business" },
  { icon: IconSchool, label: "Education" },
  { icon: IconBulb, label: "Creative" },
  { icon: IconHeart, label: "Health" },
  { icon: IconWriting, label: "Journaling" },
  { icon: IconMoodSmile, label: "Communication" },
];

const CategoryLinks: React.FC = () => {
  return (
    <div className="mt-10 sm:mt-20">
      {categories.map(({ icon: Icon, label }) => (
        <a
          key={label}
          className="m-1 py-2 px-3 inline-flex 
          items-center gap-x-2 text-sm font-medium 
          rounded-lg border border-gray-200 
          bg-white text-gray-800 shadow-sm hover:bg-gray-50
           disabled:opacity-50 disabled:pointer-events-none
            dark:bg-neutral-900 dark:border-neutral-700
             dark:text-white dark:hover:bg-neutral-800"
          href="#"
        >
          <Icon size={18} />
          {label}
        </a>
      ))}
    </div>
  );
};

export default CategoryLinks;
