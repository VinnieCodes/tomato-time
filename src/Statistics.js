import useState, { PureComponent } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function getLast7Days() {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dayName: dayNames[d.getDay()],
      dateKey: d.toISOString().slice(0, 10), // YYYY-MM-DD (use as key)
    });
  }
  return days;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label} : ${payload[0].value} minutes`}</p>
      </div>
    );
  }

  return null;
};

export default class Example extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: this.generateChartData(),
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({ data: this.generateChartData() });
    }, 1000); // update every second
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  generateChartData() {
    const focusData = JSON.parse(localStorage.getItem("focusData") || "{}");

    return getLast7Days().map(({ dayName, dateKey }) => ({
      name: dayName,
      FocusTime: Math.round((focusData[dateKey] || 0) / 60), // Convert seconds → minutes
    }));
  }

  render() {
    return (
      <div style={{ width: "auto", height: 400 }}>
        <p>Focus Time for the Last 7 Days:</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={this.state.data}
            margin={{ top: 5, right: 45, left: 5, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis
              label={{ value: "Minutes", angle: -90, position: "outsideLeft" }}
            />

            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="FocusTime"
              barSize={40}
              fill="#4772fa"
              radius={[4, 4, 4, 4]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
