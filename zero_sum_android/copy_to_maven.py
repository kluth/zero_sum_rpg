import os
import shutil

src_dir = "/home/matthias/.gradle/caches/modules-2/files-2.1"
dest_dir = "/home/matthias/project/zero_sum_rpg/zero_sum_android/repo"

for group in os.listdir(src_dir):
    group_path = os.path.join(src_dir, group)
    if not os.path.isdir(group_path):
        continue
    # Group with slashes
    group_dest_part = group.replace(".", "/")
    
    for artifact in os.listdir(group_path):
        artifact_path = os.path.join(group_path, artifact)
        if not os.path.isdir(artifact_path):
            continue
            
        for version in os.listdir(artifact_path):
            version_path = os.path.join(artifact_path, version)
            if not os.path.isdir(version_path):
                continue
                
            dest_version_dir = os.path.join(dest_dir, group_dest_part, artifact, version)
            os.makedirs(dest_version_dir, exist_ok=True)
            
            for file_hash in os.listdir(version_path):
                hash_path = os.path.join(version_path, file_hash)
                if not os.path.isdir(hash_path):
                    continue
                    
                for filename in os.listdir(hash_path):
                    src_file = os.path.join(hash_path, filename)
                    dest_file = os.path.join(dest_version_dir, filename)
                    shutil.copy2(src_file, dest_file)
                    
                    # Also copy to standard Maven name if different
                    name, ext = os.path.splitext(filename)
                    if "sources" in name.lower():
                        standard_filename = f"{artifact}-{version}-sources{ext}"
                    elif "javadoc" in name.lower():
                        standard_filename = f"{artifact}-{version}-javadoc{ext}"
                    else:
                        standard_filename = f"{artifact}-{version}{ext}"
                        
                    if filename != standard_filename:
                        dest_file_std = os.path.join(dest_version_dir, standard_filename)
                        shutil.copy2(src_file, dest_file_std)

print("Maven repository reconstructed successfully.")
