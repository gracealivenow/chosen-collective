import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function AnnouncementsScreen({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(data);
    };
    fetchAnnouncements();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#E8302A" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Announcements</Text>
      <FlatList
        data={announcements}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.body}>{item.message}</Text>
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
  date: { fontSize: 13, color: '#29ABE2', marginBottom: 6 },
  body: { fontSize: 14, color: '#555' },
});