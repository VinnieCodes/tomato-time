import Checkbox from "./Checkbox";

function Task({name, done}) {
  return (
    <div className="task">
      <Checkbox defaultChecked={done} />
      {name}
    </div>
  );
}

export default Task;
 