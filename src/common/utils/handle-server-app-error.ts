import { Dispatch } from "redux";
import { appActions } from "app/app.reducer";
import {BaseResponseType} from "common/types/common.types";


/**
 * @param - объект от сервера содержащий информацию об ошибке и другие данные
 * @param dispatch - функция из Redux
 * @param showError - флаг определяющий нужно ли отображать сообщение об ошибке для пользователя (по умолчанию true)
 * @return void - функция не возвращает зачения
 */
// jsdoc /**
export const handleServerAppError = <D>(data: BaseResponseType<D>, dispatch: Dispatch, showError: boolean=true) => {
  if(showError){
    if (data.messages.length) {
      dispatch(appActions.setAppError({ error: data.messages[0] }));
    } else {
      dispatch(appActions.setAppError({ error: "Some error occurred" }));
    }
  }
  dispatch(appActions.setAppStatus({ status: "failed" }));
};
