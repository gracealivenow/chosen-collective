import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, 'events'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#E8302A" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Upcoming Events</Text>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.detail}>{item.date} at {item.time}</Text>
            <Text style={styles.detail}>{item.location}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backText: { color: '#E8302A', fontSize: 16, marginLeft: 4 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#E8302A', marginBottom: 16 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 16, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  detail: { fontSize: 14, color: '#555', marginBottom: 2 },
  desc: { fontSize: 13, color: '#777', marginTop: 6 },
});