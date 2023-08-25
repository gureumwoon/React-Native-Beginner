import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ScrollView, Dimensions, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Fontisto } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_KEY = "d0c220376e2679a4570d675bb9f9edb9";

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cludy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
}

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);
    const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`);
    const json = await response.json();
    setDays(json.daily)
  };

  useEffect(() => {
    getWeather();
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ?
          <View style={styles.day}>
            <ActivityIndicator color="" sttyle={{ marginTop: 10 }} size="large" />
          </View>
          :
          days.map((day, index) => (
            <View key={index} style={{ ...styles.day, alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                <Text style={styles.temp}>{parseFloat(day.temp.day).toFixed(0)}</Text>
                <Fontisto name={icons[day.weather[0].main]} size={50} color="black" />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#53fcf7",
  },
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 68,
    fontWeight: "500",
    marginTop: 80,
  },
  weather: {
  },
  day: {
    width: SCREEN_WIDTH,
    padding: 25,
  },
  temp: {
    marginTop: 50,
    fontSize: 130,
  },
  description: {
    marginTop: -30,
    fontSize: 60,
    alignSelf: "flex-start"
  },
  tinyText: {
    fontSize: 18,
    alignSelf: "flex-start"
  }
});
