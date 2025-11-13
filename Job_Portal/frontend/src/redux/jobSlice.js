import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name: "job",
    initialState: {
        allJobs: [],
        allAdminJobs: [],
        singleJob: null,
        searchJobByText: "",
        allAppliedJobs: [],  // ✅ FIXED: Initialize as empty array
        searchedQuery: "",
    },
    reducers: {
        // SET ALL JOBS
        setAllJobs: (state, action) => {
            state.allJobs = action.payload;
        },
        // SET SINGLE JOB
        setSingleJob: (state, action) => {
            state.singleJob = action.payload;
        },
        // SET ALL ADMIN JOBS
        setAllAdminJobs: (state, action) => {
            state.allAdminJobs = action.payload;
        },
        // SET SEARCH JOB BY TEXT
        setSearchJobByText: (state, action) => {
            state.searchJobByText = action.payload;
        },
        // SET ALL APPLIED JOBS
        setAllAppliedJobs: (state, action) => {
            state.allAppliedJobs = action.payload;
        },
        // SET SEARCHED QUERY
        setSearchedQuery: (state, action) => {
            state.searchedQuery = action.payload;
        }
    }
});

export const {
    setAllJobs,
    setSingleJob,
    setAllAdminJobs,
    setSearchJobByText,
    setAllAppliedJobs,
    setSearchedQuery
} = jobSlice.actions;

export default jobSlice.reducer;
