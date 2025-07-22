# Shared Components

This directory contains reusable components that are used across multiple pages in the application.

## Components

### ProjectCard

A comprehensive card component for displaying project/submission information with expandable details.

```tsx
import { ProjectCard } from '@/components/shared';

<ProjectCard
  id={submission.id}
  name={submission.name}
  message={submission.message}
  status={submission.status}
  createdAt={submission.created_at}
  hasFile={submission.has_file}
  fileInfo={submission.file_info}
  fileName={submission.file_name}
  filePath={submission.file_path}
  fileSize={submission.file_size}
  services={submission.services}
  project={submission.project}
  submissionGroup={submission.submission_group}
  userInfo={{
    name: submission.user_name,
    email: submission.email
  }}
  onStatusChange={updateSubmissionStatus}
  onDownloadFile={downloadFile}
  isAdmin={true}
  isExpanded={false}
/>
```

### FileCard

A card component for displaying file information with download options.

```tsx
import { FileCard } from '@/components/shared';

<FileCard
  fileInfo={submission.file_info}
  fileName={submission.file_name}
  filePath={submission.file_path}
  fileSize={submission.file_size}
  submissionId={submission.id}
  isAdmin={true}
  onDownload={downloadFile}
/>
```

### ServiceCard

A card component for displaying service information.

```tsx
import { ServiceCard } from '@/components/shared';

<ServiceCard
  service={service}
  index={index}
  compact={false}
/>
```

## Usage

These components are designed to be used across the admin panel and user dashboard to maintain consistent UI and reduce code duplication.

- `ProjectCard`: Used for displaying project/submission information in the admin panel and user dashboard
- `FileCard`: Used for displaying file information with download options
- `ServiceCard`: Used for displaying service information in different formats (compact or detailed)