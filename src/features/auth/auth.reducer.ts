import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import { appActions } from "app/app.reducer";
import { authAPI, LoginParamsType } from "features/auth/auth.api";
import { clearTasksAndTodolists } from "common/actions";
import {createAppAsyncThunk, handleServerAppError, handleServerNetworkError} from "common/utils";
import {BaseResponseType} from "../../common/types";

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    // setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
    //   state.isLoggedIn = action.payload.isLoggedIn;
    // },
  },
    extraReducers: builder => {
        builder.addCase(login.fulfilled, (state, action)=>{
            state.isLoggedIn = action.payload.isLoggedIn;
        })
        builder.addCase(logout.fulfilled, (state, action)=>{
            state.isLoggedIn = action.payload.isLoggedIn;
        })
        builder.addCase(initializeApp.fulfilled, (state, action)=>{
            state.isLoggedIn = action.payload.isLoggedIn;
        })
    }
});



// thunks
//когда мы пишем createAppAsyncThunk всегда возвращается ПРОМИС !!!!!!
//и этот промис всегда ЗАРЕЗОЛВИН всегда fulfilled,
//чтобы обрабатывать ошибки используем метод .unwrap()
const login = createAppAsyncThunk<{isLoggedIn: boolean }, LoginParamsType>(`${slice.name}/login`, async(arg, thunkAPI)=>{
    const {dispatch, rejectWithValue} = thunkAPI;
    try{
        dispatch(appActions.setAppStatus({ status: "loading" }));
        const res = await authAPI.login(arg)
                if (res.data.resultCode === 0) {
                    dispatch(appActions.setAppStatus({ status: "succeeded" }));
                    return { isLoggedIn: true };
                } else {
                    // ❗ Если у нас fieldsErrors есть значит мы будем отображать эти ошибки
                    // в конкретном поле в компоненте (пункт 7)
                    // ❗ Если у нас fieldsErrors нету значит отобразим ошибку глобально
                    console.log(res)
                    const isShowAppError = !res.data.fieldsErrors.length
                    handleServerAppError(res.data, dispatch, isShowAppError);
                    //dispatch(appActions.setAppStatus({ status: "failed" }));
                    return rejectWithValue(res.data)

                }
    } catch(e) {
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null)
    }
})

//пишем undefined, чтобы указать явно, что ничего не принимает
const logout = createAppAsyncThunk<{isLoggedIn: boolean}, undefined>(`${slice.name}/logout`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI;
    try {
        dispatch(appActions.setAppStatus({status: "loading"}));
        const res = await authAPI.logout()
        if (res.data.resultCode === 0) {
            dispatch(clearTasksAndTodolists());
            dispatch(appActions.setAppStatus({status: "succeeded"}));
            return {isLoggedIn: false};
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (e) {
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null)
    }
})

export const initializeApp = createAppAsyncThunk<{isLoggedIn: boolean}, undefined>(`${slice.name}/initializeApp`, async (arg, thunkAPI)=>{
    const {dispatch, rejectWithValue} = thunkAPI;
    try{
        const res = await authAPI.me()
        if (res.data.resultCode === 0) {
            return {isLoggedIn: true};
        } else {
            // handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    }catch(e){
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null)
    } finally {
        dispatch(appActions.setAppInitialized({ isInitialized: true }));
    }
})

//упаковываем в объекты санки и экшены
export const authReducer = slice.reducer;
export const authActions = slice.actions;
export const authThunks = {login, logout, initializeApp}


// export const loginTC =
//   (data: LoginParamsType): AppThunk =>
//   (dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }));
//     authAPI
//       .login(data)
//       .then((res) => {
//         if (res.data.resultCode === 0) {
//           dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
//           dispatch(appActions.setAppStatus({ status: "succeeded" }));
//         } else {
//           handleServerAppError(res.data, dispatch);
//         }
//       })
//       .catch((error) => {
//         handleServerNetworkError(error, dispatch);
//       });
//   };
//
// export const logoutTC = (): AppThunk => (dispatch) => {
//   dispatch(appActions.setAppStatus({ status: "loading" }));
//   authAPI
//     .logout()
//     .then((res) => {
//       if (res.data.resultCode === 0) {
//         dispatch(authActions.setIsLoggedIn({ isLoggedIn: false }));
//         dispatch(clearTasksAndTodolists());
//         dispatch(appActions.setAppStatus({ status: "succeeded" }));
//       } else {
//         handleServerAppError(res.data, dispatch);
//       }
//     })
//     .catch((error) => {
//       handleServerNetworkError(error, dispatch);
//     });
// };