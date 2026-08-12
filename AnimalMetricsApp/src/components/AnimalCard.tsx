import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

interface AnimalCardProps {
  id: number;
  name: string;
  type?: string; // ex: 'Galinha', 'Boi'
}

export default function AnimalCard({ id, name, type }: AnimalCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/animal/[id]",
          params: { id: id, name: name },
        })
      }
    >
      <Text style={styles.name}>{name}</Text>
      {type && <Text style={styles.sub}>{type}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  name: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  sub: { color: "#aaa", fontSize: 14, marginTop: 4 },
});
