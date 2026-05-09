import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, 
  MapPin, 
  Wifi, 
  MessageSquare, 
  AlertTriangle,
  Heart,
  Share2,
  Filter,
  Plus,
  X,
  Send
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { getPosts, getNodes, initDatabase } from '../../services/db';
import { runMeshSync, broadcastPost } from '../../services/mesh_sync';

export default function CommunityScreen() {
  const [isScanning, setIsScanning] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'nodes'>('feed');
  const [posts, setPosts] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  const loadData = async () => {
    await initDatabase();
    await runMeshSync(); // Simulate sync
    const [p, n] = await Promise.all([getPosts(), getNodes()]);
    setPosts(p);
    setNodes(n);
    setIsScanning(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePost = async () => {
    if (!newPostContent.trim()) return;
    await broadcastPost(newPostContent, 'info');
    setNewPostContent('');
    setIsPostModalOpen(false);
    loadData(); // Reload
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <View style={styles.header}>
        <View>
          <Text className="text-white text-3xl font-black">LOCAL <Text className="text-primary">MESH</Text></Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className={`w-2 h-2 rounded-full ${nodes.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className={`${nodes.length > 0 ? 'text-green-500' : 'text-red-500'} text-[10px] font-black uppercase tracking-widest`}>
              {nodes.length} Peer Nodes | Stability: 94%
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={loadData} className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <Filter size={20} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={loadData} className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <Wifi size={20} color={isScanning ? "#FF5722" : "#888"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mesh Status Bar */}
      <View className="mx-6 mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20 flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#FF5722" />
          <Text className="text-primary text-[8px] font-black uppercase">Scanning for BLE/LoRa Packets...</Text>
        </View>
        <Text className="text-white/40 text-[8px] font-black uppercase">MTU: 256 bytes</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          onPress={() => setActiveTab('feed')}
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>MESH FEED</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('nodes')}
          style={[styles.tab, activeTab === 'nodes' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'nodes' && styles.activeTabText]}>ACTIVE NODES</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 20 }}
        className="flex-1"
      >
        {activeTab === 'feed' ? (
          <View className="gap-5">
            {posts.map((post, idx) => (
              <MotiView
                key={post.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: idx * 100 }}
                style={[
                  styles.postCard,
                  post.type === 'alert' && { borderColor: 'rgba(255, 87, 34, 0.3)', backgroundColor: 'rgba(255, 87, 34, 0.05)' }
                ]}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 bg-white/5 rounded-full items-center justify-center border border-white/10">
                      <Users size={14} color="#888" />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-xs">{post.author}</Text>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-gray-500 text-[9px] uppercase font-black">
                          {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-gray-700" />
                        <Text className="text-primary/60 text-[8px] font-black uppercase">Relay Path: {idx % 3 + 1} Hops</Text>
                      </View>
                    </View>
                  </View>
                  {post.type === 'alert' && (
                    <View className="bg-primary px-2 py-1 rounded-md">
                      <Text className="text-white text-[8px] font-black uppercase">CRITICAL</Text>
                    </View>
                  )}
                </View>
                <Text className={`text-sm leading-5 mb-4 ${post.content.includes('*') ? 'text-orange-200/60 font-mono italic' : 'text-gray-300'}`}>
                  {post.content}
                </Text>
                <View className="flex-row gap-4 border-t border-white/5 pt-4">
                  <TouchableOpacity className="flex-row items-center gap-2">
                    <Heart size={16} color="#444" />
                    <Text className="text-gray-500 text-[10px] font-bold">Helpful</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center gap-2">
                    <Share2 size={16} color="#444" />
                    <Text className="text-gray-500 text-[10px] font-bold">Relay (Re-Broadcast)</Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            ))}
          </View>
        ) : (
          <View style={styles.nodesContainer}>
            {isScanning ? (
              <View className="items-center py-20 gap-4">
                <ActivityIndicator color="#FF5722" />
                <Text className="text-gray-500 text-xs font-black uppercase tracking-widest">Discovering Mesh Peers...</Text>
              </View>
            ) : (
              nodes.map((user, idx) => (
                <TouchableOpacity 
                  key={user.id} 
                  activeOpacity={0.7}
                  onPress={() => setSelectedNode(user)}
                >
                  <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', delay: idx * 50 }}
                    style={styles.nodeCard}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-4">
                        <View className={`w-12 h-12 rounded-2xl items-center justify-center border ${user.role === 'Medic' ? 'bg-red-500/20 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                          {user.role === 'Medic' ? <Heart size={24} color="#f43f5e" /> : <Wifi size={24} color="#888" />}
                        </View>
                        <View>
                          <Text className="text-white font-black text-sm">{user.name}</Text>
                          <Text className="text-gray-500 text-[10px] font-bold uppercase">{user.status}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-primary font-black text-xs">{user.distance}</Text>
                        <Text className="text-gray-500 text-[9px] font-bold uppercase">Role: {user.role}</Text>
                      </View>
                    </View>
                  </MotiView>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Node Details Modal */}
      <Modal visible={!!selectedNode} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center p-8">
          <MotiView 
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#121212] rounded-[40px] border border-white/10 p-8 gap-8"
          >
            <View className="items-center gap-4">
              <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center border border-primary/20">
                {selectedNode?.role === 'Medic' ? <Heart size={48} color="#FF5722" /> : <Users size={48} color="#888" />}
              </View>
              <View className="items-center">
                <Text className="text-white text-3xl font-black">{selectedNode?.name}</Text>
                <Text className="text-primary font-black text-[10px] uppercase tracking-widest">{selectedNode?.role} NODE ACTIVE</Text>
              </View>
            </View>

            <View className="bg-white/5 p-6 rounded-3xl border border-white/5 gap-4">
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-xs font-bold">Signal Strength</Text>
                <Text className="text-green-500 text-xs font-black">92% (-64 dBm)</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-xs font-bold">Est. Distance</Text>
                <Text className="text-white text-xs font-black">{selectedNode?.distance}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-xs font-bold">Last Handshake</Text>
                <Text className="text-white text-xs font-black">2m ago</Text>
              </View>
            </View>

            <View className="gap-4">
              <TouchableOpacity 
                onPress={() => setIsChatOpen(true)}
                className="bg-primary p-5 rounded-2xl flex-row items-center justify-center gap-3"
              >
                <MessageSquare size={20} color="white" />
                <Text className="text-white font-black">MESH MESSAGE</Text>
              </TouchableOpacity>
              
              {selectedNode?.role === 'Medic' && (
                <TouchableOpacity className="bg-red-600 p-5 rounded-2xl flex-row items-center justify-center gap-3">
                  <AlertTriangle size={20} color="white" />
                  <Text className="text-white font-black">REQUEST MEDICAL AID</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                onPress={() => setSelectedNode(null)}
                className="bg-white/5 p-5 rounded-2xl items-center"
              >
                <Text className="text-gray-500 font-black">CLOSE PROTOCOL</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      </Modal>

      {/* Mesh Chat Modal */}
      <Modal visible={isChatOpen} transparent animationType="slide">
        <SafeAreaView className="flex-1 bg-black">
          <View className="flex-1 p-6 gap-6">
            <View className="flex-row items-center justify-between pb-4 border-b border-white/5">
              <View className="flex-row items-center gap-4">
                <TouchableOpacity onPress={() => setIsChatOpen(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
                <View>
                  <Text className="text-white font-black text-xl">{selectedNode?.name}</Text>
                  <Text className="text-primary text-[10px] font-black uppercase">Direct Mesh Link Active</Text>
                </View>
              </View>
              <Wifi size={20} color="#4ade80" />
            </View>

            <ScrollView className="flex-1 py-4">
              <View className="bg-white/5 p-4 rounded-2xl border border-white/10 self-start max-w-[80%]">
                <Text className="text-white text-sm">Signal established. How can I help?</Text>
                <Text className="text-gray-600 text-[9px] mt-1 uppercase font-bold">Encrypted • 2m ago</Text>
              </View>
            </ScrollView>

            <View className="bg-white/5 p-4 rounded-3xl border border-white/10 flex-row items-center">
              <TextInput 
                placeholder="Type mesh message..."
                placeholderTextColor="#444"
                className="flex-1 text-white px-2"
              />
              <TouchableOpacity className="bg-primary w-10 h-10 rounded-xl items-center justify-center">
                <Send size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Post Modal */}
      <Modal visible={isPostModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/90 justify-end">
          <MotiView from={{ translateY: 300 }} animate={{ translateY: 0 }} className="bg-card p-8 rounded-t-[40px] border-t border-white/10 gap-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-black text-2xl">MESH BROADCAST</Text>
              <TouchableOpacity onPress={() => setIsPostModalOpen(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput 
              multiline
              placeholder="Broadcast a message to nearby peers..."
              placeholderTextColor="#444"
              value={newPostContent}
              onChangeText={setNewPostContent}
              style={{ color: 'white', fontSize: 16, height: 120, backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            />
            <TouchableOpacity onPress={handlePost} className="bg-primary p-5 rounded-2xl flex-row items-center justify-center gap-3">
              <Send size={20} color="white" />
              <Text className="text-white font-black">TRANSMIT TO MESH</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>

      <TouchableOpacity onPress={() => setIsPostModalOpen(true)} style={styles.fab}>
        <Plus size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 },
  tabs: { flexDirection: 'row', marginHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: '#121212', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: '#444', fontSize: 10, fontWeight: 'black', letterSpacing: 1 },
  activeTabText: { color: '#FF5722' },
  postCard: { backgroundColor: 'rgba(18, 18, 18, 0.8)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  nodeCard: { backgroundColor: 'rgba(18, 18, 18, 0.5)', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  nodesContainer: { paddingBottom: 20 },
  fab: { position: 'absolute', right: 24, bottom: 120, width: 60, height: 60, backgroundColor: '#FF5722', borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#FF5722', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
});
