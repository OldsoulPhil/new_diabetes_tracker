import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { FoodEntry, GlucoseEntry } from "../types/types";
import GlucoseChart from "../components/GlucoseChart"; // Import GlucoseChart component
import { Requests } from "../api"; // Import Requests

export const Comparison = () => {
  const { isAuthenticated, user } = useAuth();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [glucoseEntries, setGlucoseEntries] = useState<GlucoseEntry[]>([]);
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await Requests.getAllUsers();
      setAllUsers(
        users.map((user) => user.email).filter((email) => email !== user?.email)
      );
    };

    if (user) {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const handleUserChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedUserEmail = event.target.value;
    setSelectedUser(selectedUserEmail);
    const storedUser = await Requests.getUserByEmail(selectedUserEmail);
    if (storedUser) {
      setFoodEntries(storedUser.foodEntries || []);
      setGlucoseEntries(storedUser.glucoseEntries || []);
    }
  };

  const getGraphData = () => {
    const labels = foodEntries.map((entry) =>
      new Date(entry.timestamp).toLocaleDateString()
    );

    const selectedUserGlucoseData = labels.map((label) => {
      const entry = glucoseEntries.find(
        (glucoseEntry) =>
          new Date(glucoseEntry.timestamp).toLocaleDateString() === label
      );
      return entry ? entry.glucose : null;
    });

    const currentUserGlucoseData = labels.map((label) => {
      const entry = user?.glucoseEntries?.find(
        (glucoseEntry) =>
          new Date(glucoseEntry.timestamp).toLocaleDateString() === label
      );
      return entry ? entry.glucose : null;
    });

    return {
      labels,
      datasets: [
        {
          label: "Selected User Glucose",
          data: selectedUserGlucoseData,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
        },
        {
          label: "Your Glucose",
          data: currentUserGlucoseData,
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          fill: true,
        },
      ],
    };
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      {isAuthenticated ? (
        <div className="flex flex-1 flex-col bg-black text-white items-center justify-start p-4 overflow-auto">
          <h1 className="text-3xl mb-4">Comparison Page</h1>
          <div className="w-full max-w-4xl">
            <div className="mb-4">
              <label htmlFor="userSelect" className="text-xl mr-2">
                Compare with:
              </label>
              <select
                id="userSelect"
                value={selectedUser}
                onChange={handleUserChange}
                className="bg-gray-700 text-white p-2 rounded"
              >
                <option value="">Select a user</option>
                {allUsers.map((userEmail) => (
                  <option key={userEmail} value={userEmail}>
                    {userEmail}
                  </option>
                ))}
              </select>
            </div>
            {selectedUser && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl mb-2">Food Entries</h2>
                  <ul className="list-disc pl-5">
                    {foodEntries.map((entry, index) => (
                      <li key={index} className="mb-2">
                        {entry.food} - {entry.carb}g carbs - Category:{" "}
                        {entry.category}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-8">
                  <h2 className="text-2xl mb-2">Glucose Entries</h2>
                  <ul className="list-disc pl-5">
                    {glucoseEntries.map((entry, index) => (
                      <li key={index} className="mb-2">
                        {entry.glucose} mg/dL -{" "}
                        {new Date(entry.timestamp).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h2 className="text-2xl mb-2">Comparison</h2>
                  <GlucoseChart entries={glucoseEntries} />{" "}
                  {/* Use GlucoseChart component */}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <h2>You are not logged in.</h2>
        </div>
      )}
    </div>
  );
};
