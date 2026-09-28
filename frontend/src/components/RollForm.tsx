      type RollFormProps = {
        name: string;
        expression: string;
        onNameChange: (newName: string) => void;
        onExpressionChange: (newExpression: string) => void;
        onRoll: () => void;
        connected: boolean;
      }

      function RollForm(props:RollFormProps) {
        const {
            name,
            expression,
            onNameChange,
            onExpressionChange,
            onRoll,
            connected,
            } = props;
            
        return (
            <div className="input-container">
                <label>
                Nombre
                <input
                    value={name}
                    onChange={(event) => onNameChange(event.target.value)}
                    placeholder="Tu nombre"
                />
                </label>

                <label>
                Tirada
                <input
                    value={expression}
                    onChange={(event) => onExpressionChange(event.target.value)}
                    placeholder="Expresión de dados"
                />
                </label>

                <button onClick={onRoll} disabled={!name.trim() || !connected || (expression == "")}>
                Tirar
                </button>
            </div>
        );
    }

    export default RollForm;