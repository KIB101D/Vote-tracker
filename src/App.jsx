import { useEffect, useReducer } from "react";

function VoteTracker() {
  const initialState = {
    candidates: [],
    newCandidate: "",
    status: "loading",
  };

  function reducer(state, action) {
    switch (action.type) {
      case "inputUpdate_candidate":
        return {
          ...state,
          newCandidate: action.payload,
        };
      case "add_candidate":
        if (
          !action.payload.trim() ||
          state.candidates.some(
            (candidate) => candidate.name === action.payload,
          )
        )
          return state;
        return {
          ...state,
          candidates: [...state.candidates, { name: action.payload, votes: 0 }],
          newCandidate: "",
        };

      case "voteUp":
        return incrementVote(state, action.payload);

      case "voteDown":
        return decrementVote(state, action.payload);

      case "reset_votes":
        return {
          ...state,
          candidates: state.candidates.map((candidate) => ({
            ...candidate,
            votes: 0,
          })),
        };
      case "dataReceived":
        return {
          ...state,
          candidates: action.payload,
          status: "ready",
        };
      case "dataFailed":
        return {
          ...state,
          status: "error",
        };
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:9000/candidates");
        if (!res.ok) throw new Error("Failed to fetch API");
        const data = await res.json();
        dispatch({ type: "dataReceived", payload: data });
      } catch (err) {
        dispatch({ type: "dataFailed" });
      }
    }
    fetchData();
  }, []);

  function incrementVote(state, name) {
    return {
      candidates: state.candidates.map((candidate) =>
        candidate.name === name
          ? { ...candidate, votes: candidate.votes + 1 }
          : candidate,
      ),
    };
  }

  function decrementVote(state, name) {
    return {
      candidates: state.candidates.map((candidate) =>
        candidate.name === name
          ? { ...candidate, votes: Math.max(candidate.votes - 1, 0) }
          : candidate,
      ),
    };
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  if (state.status === "loading") {
    return <p>Loading page, please wait...</p>;
  }

  if (state.status === "error") {
    return <p>Failed to fetch. Please try again</p>;
  }
  return (
    <>
      <h1>Vote Tracker</h1>
      <ul>
        {state.candidates.map((candidate) => (
          <li key={candidate.id}>
            {candidate.name}: {candidate.votes} votes
            <button
              onClick={() =>
                dispatch({ type: "voteUp", payload: candidate.name })
              }
            >
              +
            </button>
            <button
              onClick={() =>
                dispatch({ type: "voteDown", payload: candidate.name })
              }
            >
              -
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => dispatch({ type: "reset_votes" })}>
        Reset Votes
      </button>

      <div>
        <h2>Add Candidate</h2>
        <input
          type="text"
          value={state.newCandidate}
          placeholder="Candidate name"
          onChange={(e) =>
            dispatch({ type: "inputUpdate_candidate", payload: e.target.value })
          }
        />
        <button
          onClick={() =>
            dispatch({ type: "add_candidate", payload: state.newCandidate })
          }
        >
          Add
        </button>
      </div>
    </>
  );
}

export default VoteTracker;
