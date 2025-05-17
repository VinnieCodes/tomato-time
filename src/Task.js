import Checkbox from "./Checkbox";

function Task({ name, done, onToggle }) {
  return (
    <div className="task">
      <Checkbox checked={done} onClick={() => onToggle(!done)} />
      {name}
    </div>
  );
}

export default Task;
