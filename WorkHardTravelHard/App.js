import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { theme } from './color';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos"

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [checked, setChecked] = useState(false);
  const [modify, setModify] = useState(false);
  const [modifyInput, setModifyInput] = useState("");
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [travelprogressBarWidth, setTravelProgressBarWidth] = useState(0);

  useEffect(() => {
    loadToDos();
  }, [])

  useEffect(() => {
    loadProgressWidth();
    loadTravelProgressWidth();
  }, [])

  useEffect(() => {
    loadWorking();
  }, [working])


  const travel = () => {
    setWorking(false);
    AsyncStorage.setItem("currentWorkState", "false");
  }
  const work = () => {
    setWorking(true);
    AsyncStorage.setItem("currentWorkState", "true");
  }

  const onChangeText = (payload) => setText(payload);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));
    } catch (error) {
      console.log(error)
    }
  }

  const loadWorking = async () => {
    try {
      const workingState = await AsyncStorage.getItem("currentWorkState");
      setWorking(workingState === "true");
    } catch (error) {
      console.log(error)
    }
  }

  const saveTravelProgressWidth = async (toSave) => {
    const progressString = toSave.toString()
    try {
      await AsyncStorage.setItem("travelProgress", progressString);
    } catch (error) {

    }
  }

  const loadTravelProgressWidth = async () => {
    try {
      const savedTravelProgressWidth = await AsyncStorage.getItem("travelProgress");
      setTravelProgressBarWidth(parseFloat(savedTravelProgressWidth));
    } catch (error) {

    }
  }

  const saveWorkProgressWidth = async (toSave) => {
    try {
      const progressString = toSave.toString();
      await AsyncStorage.setItem("workProgress", progressString);
    } catch (error) {
      console.log(error);
    }
  }

  const loadProgressWidth = async () => {
    try {
      const savedWidth = await AsyncStorage.getItem("workProgress");
      setProgressBarWidth(parseFloat(savedWidth));
    } catch (error) {
      console.log(error);
    }
  }

  const addToDo = async () => {
    if (text === "") {
      return
    }
    // save todo
    const newToDos = { ...toDos, [Date.now()]: { text, working } }
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  }

  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos }
          delete newToDos[key]
          setToDos(newToDos);
          saveToDos(newToDos);
        }
      },
    ])
  }

  const completeToDo = async (key) => {
    setChecked(!checked);
    const newToDos = { ...toDos };
    newToDos[key].checked = !newToDos[key].checked;
    setToDos(newToDos);
    await saveToDos(newToDos)

    if (toDos[key].working) {
      const calculateBar = calculateProgressBar("Work");
      setProgressBarWidth(calculateBar);
      await saveWorkProgressWidth(calculateBar)
    } else {
      const calculateBar = calculateProgressBar("Travel");
      setTravelProgressBarWidth(calculateBar);
      await saveTravelProgressWidth(calculateBar)
    }
  }

  const modifyToDo = async (key) => {
    try {
      const newToDos = { ...toDos }
      newToDos[key] = { text: modifyInput, working, checked }
      setToDos(newToDos);
      await saveToDos(newToDos);
      setModify(false)
    } catch (error) {
      console.log(error)
    }

  }

  // checked가 true인 투두 갯수
  const countCheckedTodo = () => {
    const todoArray = Object.values(toDos);
    return todoArray.filter((todo) => todo.checked).length;
  }

  // progress bar 길이 계산
  const calculateProgressBar = (screen) => {
    const checkedTodo = countCheckedTodo();
    const totalCount = Object.keys(toDos).length;

    let widthRatio = 0;

    widthRatio = totalCount === 0 ? 0 : checkedTodo / totalCount;

    if (screen === "Travel") {
      const travleCheckedTodo = Object.values(toDos).filter((todo) => todo.working === false && todo.checked).length;
      widthRatio = travleCheckedTodo / totalCount;
    }
    return widthRatio;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.barTextContainer}>
        <Text style={styles.barText}>0</Text>
        <Text style={styles.barText}>100</Text>
      </View>
      {
        working ?
          (
            <View style={styles.barContainer}>
              <View style={{ ...styles.bar, flex: progressBarWidth }}></View>
            </View>
          ) :
          (
            <View style={styles.barContainer}>
              <View style={{ ...styles.bar, flex: travelprogressBarWidth }}></View>
            </View>
          )
      }

      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {
          Object.keys(toDos).map((key) =>
            toDos[key].working === working ?
              (
                <View style={styles.toDo} key={key}>
                  {
                    modify ?
                      <TextInput
                        onSubmitEditing={() => modifyToDo(key)}
                        onChangeText={(payload) => setModifyInput(payload)}
                        returnKeyType="done"
                        value={modifyInput}
                        style={styles.modifyInput}
                      /> :
                      <Text style={{ ...styles.toDoText, textDecorationLine: toDos[key].checked === true ? "line-through" : "none" }}>{toDos[key].text}</Text>
                  }
                  <View style={styles.icons}>
                    <TouchableOpacity style={styles.icon} onPress={() => completeToDo(key)}>
                      <Fontisto name="check" size={18} color={theme.grey} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.icon} onPress={() => setModify(true)}>
                      <Octicons name="pencil" size={24} color={theme.grey} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.icon} onPress={() => deleteToDo(key)}>
                      <Fontisto name="trash" size={18} color={theme.grey} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: 600,
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  icons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  icon: {
    marginLeft: 16,
  },
  modifyInput: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  barContainer: {
    flexDirection: "row",
    height: 20,
    backgroundColor: theme.toDoBg,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 5,
  },
  bar: {
    height: 20,
    backgroundColor: "#fcba03",
    borderRadius: 5,
  },
  barTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: -15,
    marginTop: 10
  },
  barText: {
    color: theme.toDoBg,
  }
});
