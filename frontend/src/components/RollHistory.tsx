
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { RollResult } from "../types";

type RollHistoryProps = {
  latestRolls: RollResult[];
};

function RollHistory(props: RollHistoryProps){
    const {latestRolls} = props;
    return (
        <div className="latestRolls" hidden={latestRolls.length === 0}>
            {latestRolls.map((roll) => (
            <div className="rollEntry" key={roll.id}>
            <span className="rollHeader">
                <strong>{roll.name}</strong>
            </span>

            <span className="rollDetails">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {roll.details}
                </ReactMarkdown>
            </span>
            </div>
            ))}

        </div>
    );
}

export default RollHistory;