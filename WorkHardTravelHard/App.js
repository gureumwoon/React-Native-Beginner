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

  useEffect(() => {
    loadToDos();
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

  const completeToDo = (key) => {
    setChecked(!checked);
    const updateToDos = { ...toDos[key], text: toDos[key].text, working, checked };
    const newToDos = { ...toDos, [key]: updateToDos }
    setToDos(newToDos);
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
                      <Text style={{ ...styles.toDoText, textDecorationLine: checked && "line-through" }}>{toDos[key].text}</Text>
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
  }
});
