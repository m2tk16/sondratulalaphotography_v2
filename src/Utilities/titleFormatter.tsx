
interface ExtractAndFormatProps {
  path: string;
}

const ExtractAndFormat: React.FC<ExtractAndFormatProps> = ({ path }) => {
  const formatPath = () => {
    if (!path || typeof path !== "string") {
      console.error("Invalid path:", path);
      return "Unknown Title";
    }

    const parts = path.split("/");
    if (parts.length < 4) {
      console.error("Unexpected path structure:", path);
      return "Unknown Title";
    }

    const extracted = parts[3].split(".")[0];
    const formatted = extracted.replace(/_/g, " ");
    return formatted
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return <span>{formatPath()}</span>;
};

export default ExtractAndFormat;
