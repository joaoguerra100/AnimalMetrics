import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import api from '../services/api';

interface Animal {
  id: number;
  name: string;
  species: string;
}

export default function Home() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.get('/animals')
      .then(response => setAnimals(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Meus Animais', headerShown: true }} />
      
      <FlatList
        data={animals}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.card} 
            onPress={() => router.push(`/animal/${item.id}?name=${item.name}` as any)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.species}>{item.species}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#121212' },
  card: { backgroundColor: '#1e1e1e', padding: 20, marginBottom: 12, borderRadius: 12, borderLeftWidth: 5, borderLeftColor: '#4CAF50' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  species: { fontSize: 14, color: '#aaa', textTransform: 'capitalize' }
});