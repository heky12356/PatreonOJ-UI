//ContentComponent.jsx
import React from "react";
import HomeComponent from "./HomeComponent";
import StudyComponent from "./StudyComponent";
import ProblemComponent from "./ProblemComponent";
import QuestionBank from "./QuestionBank.jsx";
import Rank from "./Rank.jsx";

const ContentComponent = ({ currentKey }) => {

  switch (currentKey) {
    case "1":
      return <HomeComponent />;
    case "2":
      return <StudyComponent />;
    case "3":
      return <ProblemComponent />;
    case "4":
      return <QuestionBank />;
    case "5":
      return <ProblemComponent />;

    default:
      return <Rank />;
  }
};

export default ContentComponent;