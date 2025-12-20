import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Calendar, LogOut, User } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Avatar, Button, Card, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import checkTokenAvalibility from "../../tools/checkforToken";
import { LoadingScreen } from "../../tools/loadingScreen";

import AttendanceStarter from "./AttendanceStarter";

const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const BASE_URL = `http://${LOCALHOST}:${SERVERPORT}/teacher`;
const ADMIN_URL = `http://${LOCALHOST}:${SERVERPORT}/admin`;

const initialProfileState = {
  username: "Teacher",
  role: "Teacher",
  department: "N/A",
  assignedSubjects: [],
  profileImage: null,
};

const TeacherHomePage = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(initialProfileState);
  const [routineData, setRoutineData] = useState(null); // Stores the whole "data" object
  const [fullRoutine, setFullRoutine] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleError = (message) => {
    Alert.alert("Error", message || "An unexpected error occurred.");
  };

  const fetchData = useCallback(async () => {
    const token = await checkTokenAvalibility();
    if (!token) {
      handleError("Authentication required. Logging out.");
      await handleLogout(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 1. Fetch Profile
    try {
      const profileRes = await fetch(`${BASE_URL}/profile`, {
        method: "GET",
        headers,
      });
      if (profileRes.ok) {
        const json = await profileRes.json();
        const userData = json.user;
        setProfile({
          username: userData.username || "Teacher",
          role: userData.role || "Teacher",
          department: userData.department || "N/A",
          assignedSubjects: userData.assignedSubjects || [],
          profileImage: userData.profileImage,
        });
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    }

    // 2. Fetch Today's Routine (Accessing .data)
    try {
      const routineRes = await fetch(`${ADMIN_URL}/todaysRoutine`, {
        method: "GET",
        headers,
      });
      const json = await routineRes.json();
      if (routineRes.ok) {
        setRoutineData(json.data); // This contains dayOfWeek, collegeStatus, and classes
      }
    } catch (err) {
      console.error("Today's Routine Error:", err);
    }

    // 3. Fetch Full Routine (Accessing .data.routine)
    try {
      const fullRoutineRes = await fetch(`${ADMIN_URL}/viewRoutine`, {
        method: "GET",
        headers,
      });
      const json = await fullRoutineRes.json();
      if (fullRoutineRes.ok) {
        setFullRoutine(json.data?.routine || []);
        console.log(fullRoutine)
      }
    } catch (err) {
      console.error("Full Routine Error:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        await fetchData();
        setIsLoading(false);
      };
      loadData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  const handleTakeAttendance = useCallback(async (currentSubject) => {
    const token = await checkTokenAvalibility();
    if (!token) return false;

    try {
      const response = await fetch(`${BASE_URL}/takeattendance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentSubject }),
      });

      const responseData = await response.json();
      if (response.ok) {
        Alert.alert("Success", responseData.message);
        return true;
      } else {
        Alert.alert("Failed", responseData.message);
        return false;
      }
    } catch (err) {
      Alert.alert("Network Error", "Could not connect to server.");
      return false;
    }
  }, []);

  const handleLogout = async (showConfirmation = true) => {
    const logoutAction = async () => {
     setIsLoading(true);
            await AsyncStorage.clear();
            navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
            setIsLoading(false);
    };

    if (showConfirmation) {
      Alert.alert("Logout", "Are you sure?", [
        { text: "Cancel" },
        { text: "Logout", onPress: logoutAction, style: "destructive" },
      ]);
    } else {
      await logoutAction();
    }
  };

  if (isLoading) return <LoadingScreen loadingVisibility={isLoading} />;

  const { username, role, department, assignedSubjects, profileImage } =
    profile;
  const profileUri = profileImage
    ? {
        uri: `http://${LOCALHOST}:${SERVERPORT}/public/upload/teacher/${profileImage}`,
      }
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Avatar.Text
              size={50}
              label={username.charAt(0)}
              source={profileUri}
              style={{ backgroundColor: "#2563eb" }}
            />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.greeting}>
                Welcome, {username.split(" ")[0]}!
              </Text>
              <Text style={styles.roleBadge}>
                {role} • {department}
              </Text>
            </View>
          </View>
          <Button
            icon={() => <LogOut size={18} color="#dc3545" />}
            onPress={() => handleLogout()}
            compact
          >
            <Text>Logout</Text>
          </Button>
        </View>

        <Divider style={styles.divider} />

        <AttendanceStarter
          assignedSubjects={assignedSubjects}
          handleTakeAttendance={handleTakeAttendance}
        />

        {/* Today's Routine - Accessing Nested Data */}
        <Text style={styles.sectionHeader}>
          Today's Routine ({routineData?.dayOfWeek?.toUpperCase() || "..."})
        </Text>

        {routineData?.collegeStatus === "closed" ? (
          <Card style={[styles.routineCard, styles.routineClosed]}>
            <Card.Content>
              <Text style={styles.routineClosedText}>
                College is Closed Today
              </Text>
            </Card.Content>
          </Card>
        ) : routineData?.classes?.length > 0 ? (
          routineData.classes.map((item, index) => (
            <Card key={item._id || index} style={styles.routineCard}>
              <Card.Content style={styles.routineContent}>
                <View>
                  <Text style={styles.routineSubject}>{item.subject}</Text>
                  <Text style={styles.routineTime}>
                    {item.startTime} - {item.endTime}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {item.classStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Calendar size={20} color="#64748b" />
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.routineCard}>
            <Card.Content>
              <Text style={styles.routineEmptyText}>
                No classes scheduled for today.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Card
            style={styles.actionCard}
            onPress={() => navigation.navigate("TeacherProfile")}
          >
            <Card.Content style={styles.actionContent}>
              <User size={24} color="#2563eb" />
              <Text style={styles.actionText}>View Profile</Text>
            </Card.Content>
          </Card>
          <Card
            style={styles.actionCard}
            onPress={() =>
              Alert.alert(
                "Full Routine",
                `This feature is only for students`
              )
            }
          >
            <Card.Content style={styles.actionContent}>
              <Calendar size={24} color="#2563eb" />
              <Text style={styles.actionText}>Full Routine</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f1f5f9" },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  profileInfo: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  greeting: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  roleBadge: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  divider: { marginBottom: 20 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginTop: 10,
    marginBottom: 12,
  },
  routineCard: {
    elevation: 1,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
  },
  routineContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routineSubject: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  routineTime: { fontSize: 14, color: "#64748b", marginTop: 2 },
  statusBadge: {
    backgroundColor: "#dbeafe",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  statusBadgeText: { fontSize: 10, fontWeight: "700", color: "#2563eb" },
  routineEmptyText: {
    textAlign: "center",
    color: "#94a3b8",
    paddingVertical: 10,
  },
  routineClosed: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  routineClosedText: {
    textAlign: "center",
    color: "#dc2626",
    fontWeight: "bold",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "white",
  },
  actionContent: { alignItems: "center", paddingVertical: 15, gap: 5 },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 5,
  },
});

export default TeacherHomePage;
